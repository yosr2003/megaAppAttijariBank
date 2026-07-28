import cv2
from insightface.app import FaceAnalysis

app = FaceAnalysis()
app.prepare(ctx_id=0)

image = cv2.imread(r"C:\Users\YosrAmamou\Downloads\photoprofil.jpg")

faces = app.get(image)

print("Nombre de visages :", len(faces))

if len(faces) > 0:
    face = faces[0]

    embedding = face.embedding

    print("Taille de l'embedding :", embedding.shape)
    print("Premières valeurs :")
    print(embedding[:10])