import os
import uuid
import cv2

from flask import Flask, request, jsonify
from insightface.app import FaceAnalysis
import numpy as np


# -----------------------------
# Initialisation Flask
# -----------------------------
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# Chargement du modèle InsightFace
# -----------------------------
face_app = FaceAnalysis()
face_app.prepare(ctx_id=0)

# -----------------------------
# Route de test
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return "Face Recognition Service is running!"

# -----------------------------
# Extraction de l'embedding
# -----------------------------
@app.route("/extract", methods=["POST"])
def extract_embedding():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "Aucune image reçue."
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "Nom de fichier vide."
        }), 400

    filename = str(uuid.uuid4()) + ".jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    image = cv2.imread(filepath)

    if image is None:
        os.remove(filepath)
        return jsonify({
            "success": False,
            "message": "Impossible de lire l'image."
        }), 400

    faces = face_app.get(image)

    if len(faces) == 0:
        os.remove(filepath)
        return jsonify({
            "success": False,
            "message": "Aucun visage détecté."
        }), 400

    face = faces[0]

    embedding = face.embedding.tolist()

    # Suppression de l'image temporaire
    os.remove(filepath)

    return jsonify({
        "success": True,
        "embedding": embedding
    })



def cosine_similarity(embedding1, embedding2):
    emb1 = np.array(embedding1)
    emb2 = np.array(embedding2)

    similarity = np.dot(emb1, emb2) / (
        np.linalg.norm(emb1) * np.linalg.norm(emb2)
    )

    return float(similarity)

@app.route("/compare", methods=["POST"])
def compare():

    try:

        data = request.get_json()

        embedding1 = data["embedding1"]
        embedding2 = data["embedding2"]

        similarity = cosine_similarity(
            embedding1,
            embedding2
        )

        return jsonify({
            "success": True,
            "similarity": similarity
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# -----------------------------
# Lancement
# -----------------------------
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )