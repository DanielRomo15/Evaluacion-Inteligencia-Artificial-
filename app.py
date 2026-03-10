from flask import Flask, render_template, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import base64
import io

app = Flask(__name__)

model = load_model("model/digit_model.h5")


def preprocess_image(img):

    img = np.array(img)

    img = 255 - img

    img[img < 50] = 0

    coords = np.column_stack(np.where(img > 0))

    if coords.size > 0:

        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)

        height = y_max - y_min
        width = x_max - x_min

        # detección simple del número 1
        if width < height * 0.25 and height > 60:
            return "one"

        img = img[y_min:y_max, x_min:x_max]

    img = Image.fromarray(img)

    img = img.resize((20,20))

    new_img = Image.new("L",(28,28))
    new_img.paste(img,(4,4))

    img = np.array(new_img)

    img = img / 255.0

    img = img.reshape(1,28,28,1)

    return img


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json["image"]

    image_data = data.split(",")[1]

    img = Image.open(io.BytesIO(base64.b64decode(image_data))).convert("L")

    img = preprocess_image(img)

    if isinstance(img,str) and img == "one":

        probs = [0]*10
        probs[1] = 99.9

        return jsonify({
            "digit":1,
            "probabilities":probs
        })

    prediction = model.predict(img)

    digit = int(np.argmax(prediction))

    probabilities = prediction[0].tolist()

    probabilities = [round(p*100,2) for p in probabilities]

    return jsonify({
        "digit": digit,
        "probabilities": probabilities
    })


if __name__ == "__main__":
    app.run(debug=True)