
from jose import jwt
from passlib.context import CryptContext

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import shutil
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

app = FastAPI()

load_dotenv()
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


# ================= JWT =================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= MONGODB =================

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)
db = client["ujjain_samachar"]

news_collection = db["news"]

team_collection = db["team"]

reels_collection = db["reels"]
# ================= UPLOAD FOLDER =================

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ================= STATIC FILES =================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# ================= GET ALL NEWS =================

@app.get("/news")
def get_news():

    news = list(
        news_collection.find(
            {},
            {"_id": 0}
        )
    )

    return news

# ================= GET SINGLE NEWS =================

@app.get("/news/{news_id}")
def get_single_news(news_id: int):

    news = news_collection.find_one(
        {"id": news_id},
        {"_id": 0}
    )

    if news:
        return news

    return {
        "message": "News not found"
    }

# ================= UPLOAD NEWS =================

@app.post("/upload-news")
async def upload_news(
    title: str = Form(...),
    description: str = Form(...),
    media: UploadFile = File(...)
):

    result = cloudinary.uploader.upload(
        media.file,
        resource_type="auto"
    )

    media_url = result["secure_url"]

    news_count = news_collection.count_documents({})

    new_news = {
        "id": news_count + 1,
        "title": title,
        "description": description,
        "media": media_url,
        "type": "video" if media.content_type.startswith("video") else "image",
        "time": datetime.now().strftime("%d %b %Y | %I:%M %p"),
        "likes": 0,
        "comments": []
    }

    news_collection.insert_one(new_news)

    return {
        "message": "News Uploaded Successfully"
    }
# ================= DELETE NEWS =================

@app.delete("/delete-news/{news_id}")
def delete_news(news_id: int):

    news_collection.delete_one(
        {"id": news_id}
    )

    return {
        "message": "News Deleted Successfully"
    }

# ================= LOGIN =================

@app.post("/login")
def login(data: dict):

    username = data.get("username")

    password = data.get("password")

    if (
    username == os.getenv("ADMIN_USERNAME")
    and
    password == os.getenv("ADMIN_PASSWORD")
):

        token = jwt.encode(
            {"username": username},
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "token": token
        }

    return {
        "message": "Invalid Credentials"
    }

# ================= UPDATE NEWS =================

@app.put("/update-news/{news_id}")
async def update_news(
    news_id: int,
    title: str = Form(...),
    description: str = Form(...),
    media: UploadFile = File(...)
):

    media_path = f"uploads/{media.filename}"

    with open(media_path, "wb") as buffer:
        shutil.copyfileobj(media.file, buffer)

    news_collection.update_one(

        {"id": news_id},

        {
            "$set": {

                "title": title,

                "description": description,

                "media":
                    f"https://ujjain-samachar.onrender.com/{media_path}",

                "type":
                    "video"
                    if media.content_type.startswith("video")
                    else "image"
            }
        }

    )

    return {
        "message": "News Updated Successfully"
    }
# ================= LIKE NEWS =================

@app.put("/like-news/{news_id}")
def like_news(news_id: int):

    news_collection.update_one(

        {"id": news_id},

        {
            "$inc": {
                "likes": 1
            }
        }

    )

    return {
        "message": "Liked"
    }
# ================= ADD COMMENT =================

@app.put("/comment-news/{news_id}")
def comment_news(
    news_id: int,
    data: dict
):

    news_collection.update_one(

        {"id": news_id},

        {
            "$push": {
                "comments": data["comment"]
            }
        }

    )

    return {
        "message": "Comment Added"
    }
# ================= BREAKING NEWS =================

breaking_news = {
    "text": "Welcome To Ujjain Samachar"
}

@app.get("/breaking-news")
def get_breaking_news():

    return breaking_news

@app.put("/breaking-news")
def update_breaking_news(data: dict):

    breaking_news["text"] = data["text"]

    return {
        "message": "Breaking News Updated"
    }
# ================= ADD TEAM MEMBER =================

@app.post("/add-team")
async def add_team_member(
    name: str = Form(...),
    position: str = Form(...),
    contact: str = Form(...),
    dob: str = Form(...),
    address: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...)
):

    # Upload image to Cloudinary
    result = cloudinary.uploader.upload(
        image.file,
        resource_type="image"
    )

    image_url = result["secure_url"]

    team_count = team_collection.count_documents({})

    new_member = {

        "id": team_count + 1,

        "name": name,

        "position": position,

        "contact": contact,

        "dob": dob,

        "address": address,

        "description": description,

        "image": image_url
    }

    team_collection.insert_one(new_member)

    return {
        "message": "Team Member Added"
    }


# ================= GET TEAM MEMBERS =================

@app.get("/team")
def get_team_members():

    members = list(
        team_collection.find(
            {},
            {"_id": 0}
        )
    )

    return members


# ================= DELETE TEAM MEMBER =================

@app.delete("/delete-team/{member_id}")
def delete_team_member(member_id: int):

    team_collection.delete_one(
        {"id": member_id}
    )

    return {
        "message": "Member Deleted"
    }
# ================= UPLOAD REEL =================

@app.post("/upload-reel")
async def upload_reel(

    title: str = Form(...),

    video: UploadFile = File(...)

):

    video_path = f"uploads/{video.filename}"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    reel_count =reels_collection.count_documents({})

    new_reel = {

        "id": reel_count + 1,

        "title": title,

        "video":
            f"https://ujjain-samachar.onrender.com/{video_path}"
    }

    reels_collection.insert_one(new_reel)

    return {
        "message": "Reel Uploaded"
    }


# ================= GET REELS =================

@app.get("/reels")
def get_reels():

    reels = list(

        reels_collection.find(
            {},
            {"_id": 0}
        )

    )

    return reels


# ================= DELETE REEL =================

@app.delete("/delete-reel/{reel_id}")
def delete_reel(reel_id: int):

    reels_collection.delete_one(
        {"id": reel_id}
    )

    return {
        "message": "Reel Deleted"
    }