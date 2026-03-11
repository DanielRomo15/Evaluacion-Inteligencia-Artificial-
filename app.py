from flask import Flask, render_template, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import base64
import io

app = Flask(__name__)

# cargar modelo entrenado
model = load_model("model/digit_model.h5")


def preprocess_image(img):

    img = np.array(img)

    # invertir colores
    img = 255 - img

    # limpiar ruido
    img[img < 50] = 0

    coords = np.column_stack(np.where(img > 0))

    if coords.size > 0:

        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)

        height = y_max - y_min
        width = x_max - x_min

        # detección especial del número 1
        if width < height * 0.25 and height > 60:
            return "one", None

        img = img[y_min:y_max, x_min:x_max]

    img = Image.fromarray(img)

    # reducir a 20x20
    img = img.resize((20, 20))

    # centrar en imagen 28x28
    new_img = Image.new("L", (28, 28))
    new_img.paste(img, (4, 4))

    img_array = np.array(new_img)

    # normalizar
    img_array = img_array / 255.0

    img_array = img_array.reshape(1, 28, 28, 1)

    return img_array, new_img


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json["image"]

    image_data = data.split(",")[1]

    img = Image.open(io.BytesIO(base64.b64decode(image_data))).convert("L")

    processed, processed_img = preprocess_image(img)

    # si detectó el numero 1 manualmente
    if isinstance(processed, str) and processed == "one":

        probs = [0]*10
        probs[1] = 99.9

        return jsonify({
            "digit": 1,
            "probabilities": probs,
            "top3": [(1, 99.9), (7, 0.1), (4, 0.0)]
        })

    prediction = model.predict(processed)

    digit = int(np.argmax(prediction))

    probabilities = prediction[0].tolist()

    probabilities = [round(p*100,2) for p in probabilities]

    # calcular top 3
    top3 = sorted(
        [(i, probabilities[i]) for i in range(10)],
        key=lambda x: x[1],
        reverse=True
    )[:3]

    # convertir imagen 28x28 a base64 para mostrar en frontend
    buffer = io.BytesIO()
    processed_img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return jsonify({
        "digit": digit,
        "probabilities": probabilities,
        "top3": top3,
        "processed_image": img_str
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)