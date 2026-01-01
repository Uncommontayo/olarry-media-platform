import azure.functions as func
import logging
import uuid
import json
import os
from datetime import datetime, timedelta
from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import (
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions,
    ContentSettings,
)

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

STORAGE_CONNECTION_STRING = os.environ["STORAGE_CONNECTION_STRING"]
CONTAINER_NAME = "images"

# ---------- GLOBAL CORS ----------
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
}


def cors_response(body="", status=200, mimetype=None):
    return func.HttpResponse(
        body=body,
        status_code=status,
        mimetype=mimetype,
        headers=CORS_HEADERS,
    )


# ---------- UPLOAD ----------
@app.route(route="upload_media", methods=["POST", "OPTIONS"])
def upload_media(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return cors_response(status=204)

    try:
        body = req.get_body()
        caption = req.params.get("caption", "")
        username = req.params.get("username", "anonymous")

        if not body:
            return cors_response("No file uploaded", 400)

        blob_service = BlobServiceClient.from_connection_string(
            STORAGE_CONNECTION_STRING
        )
        container = blob_service.get_container_client(CONTAINER_NAME)

        try:
            container.create_container()
        except Exception:
            pass

        # try to infer extension from incoming Content-Type header
        content_type = req.headers.get("Content-Type") or req.headers.get("content-type") or ""
        ext_map = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
        }
        ext = ext_map.get(content_type.split(";")[0].strip().lower(), "jpg")
        filename = f"{uuid.uuid4()}.{ext}"

        metadata = {
            "caption": caption,
            "username": username,
            "likes": "0",
            "uploaded_at": datetime.utcnow().isoformat(),
        }

        # set content type on blob so browsers render images correctly
        try:
            cs = ContentSettings(content_type=content_type or f"image/{ext}")
        except Exception:
            cs = None

        container.upload_blob(
            name=filename,
            data=body,
            overwrite=True,
            metadata=metadata,
            content_settings=cs,
        )

        return cors_response(
            json.dumps({"name": filename}),
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("Upload failed")
        return cors_response(str(e), 500)


# ---------- LIST ----------
@app.route(route="list_media", methods=["GET", "OPTIONS"])
def list_media(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return cors_response(status=204)

    try:
        blob_service = BlobServiceClient.from_connection_string(
            STORAGE_CONNECTION_STRING
        )
        container = blob_service.get_container_client(CONTAINER_NAME)

        posts = []

        try:
            blobs = container.list_blobs(include=["metadata"])
        except ResourceNotFoundError:
            # Container not created yet; treat as empty feed.
            blobs = []

        for blob in blobs:
            sas = generate_blob_sas(
                account_name=blob_service.account_name,
                container_name=CONTAINER_NAME,
                blob_name=blob.name,
                account_key=blob_service.credential.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=2),
            )

            posts.append(
                {
                    "name": blob.name,
                    "url": f"https://{blob_service.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob.name}?{sas}",
                    "caption": blob.metadata.get("caption", ""),
                    "username": blob.metadata.get("username", "anonymous"),
                    "likes": int(blob.metadata.get("likes", "0")),
                    "uploaded_at": blob.metadata.get("uploaded_at"),
                }
            )

        return cors_response(
            json.dumps(posts),
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("List failed")
        return cors_response(str(e), 500)


# ---------- LIKE ----------
@app.route(route="like_media", methods=["POST", "OPTIONS"])
def like_media(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return cors_response(status=204)

    try:
        name = req.params.get("name")
        if not name:
            return cors_response("Missing name", 400)

        blob_service = BlobServiceClient.from_connection_string(
            STORAGE_CONNECTION_STRING
        )
        blob = blob_service.get_blob_client(CONTAINER_NAME, name)

        try:
            props = blob.get_blob_properties()
        except ResourceNotFoundError:
            return cors_response("Not found", 404)

        likes = int(props.metadata.get("likes", "0")) + 1
        props.metadata["likes"] = str(likes)
        blob.set_blob_metadata(props.metadata)

        return cors_response(
            json.dumps({"likes": likes}),
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("Like failed")
        return cors_response(str(e), 500)


# ---------- DELETE ----------
@app.route(route="delete_media", methods=["DELETE", "OPTIONS"])
def delete_media(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return cors_response(status=204)

    try:
        name = req.params.get("name")
        if not name:
            return cors_response("Missing name", 400)

        blob_service = BlobServiceClient.from_connection_string(
            STORAGE_CONNECTION_STRING
        )
        blob = blob_service.get_blob_client(CONTAINER_NAME, name)
        try:
            blob.delete_blob()
        except ResourceNotFoundError:
            return cors_response("Not found", 404)

        return cors_response(
            json.dumps({"deleted": name}),
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("Delete failed")
        return cors_response(str(e), 500)


# ---------- AI CAPTION ----------
@app.route(route="ai_caption", methods=["GET", "OPTIONS"])
def ai_caption(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return cors_response(status=204)

    try:
        name = req.params.get("name")
        if not name:
            return cors_response("Missing name", 400)

        blob_service = BlobServiceClient.from_connection_string(
            STORAGE_CONNECTION_STRING
        )
        blob = blob_service.get_blob_client(CONTAINER_NAME, name)
        try:
            props = blob.get_blob_properties()
        except ResourceNotFoundError:
            return cors_response("Not found", 404)

        username = props.metadata.get("username", "someone")
        date = props.metadata.get("uploaded_at", "")[:10]

        caption = (
            f"A moment captured by @{username}. "
            f"Shared on {date}. Visual storytelling at its finest."
        )

        return cors_response(
            json.dumps({"caption": caption}),
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("AI caption failed")
        return cors_response(str(e), 500)
