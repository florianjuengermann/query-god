from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_cors import cross_origin
import backend.main as main
import subprocess
from email import message
from io import StringIO
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

app = Flask(__name__)
CORS(app)


@app.route("/")
@cross_origin()
def index():
    return "Hello this is the new version!"

@app.route("/rekick-model", methods=["POST"])
@cross_origin()
def rekick_model():
    content = request.get_json()
    print(content)
    user_id = content["user_id"]
    return jsonify(user_id)

# send email
@app.route("/send_email", methods=["POST"])
@cross_origin()
def send_email():
    # smtp.sendgrid.net
    """
    
25, 587	(for unencrypted/TLS connections)
465	(for SSL connections)
    username:apikey
    Password: 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
    """
    content = request.get_json()
    email = content["email"]
    message = content["message"]
    print(message)
    gmail_user = 'apikey'
    gmail_password = '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'

    sent_from = "assemblyhackathon@gmail.com"
    subject = 'Support request'
    body = message
   
    msg = MIMEMultipart('alternative')
    msg['From'] = formataddr((str(Header(u'Alał', 'utf-8')), sent_from))
    msg['To'] = formataddr((str(Header(u'Alał', 'utf-8')), email))
    
    # Record the MIME types of text/html.
    msg.attach(MIMEText(body, 'html'))

    
    try:
        server = smtplib.SMTP_SSL('smtp.sendgrid.net', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, email, msg.as_string())
        server.close()

        print('Email sent!')
    # catch error
    except Exception as e:        
        print(e,'Something went wrong...')
    return "email sent"
    

@app.route("/api", methods=["POST"])
@cross_origin()
def api():
    data = request.get_json()
    print("data:", data)
    history = data["history"]
    res = main.run(history)
    return jsonify(res)
# flask paraters python and file name 

@app.route("/run", methods=["POST"])
@cross_origin()
def run():
    content = request.get_json()
    python = content["python"]
    print("hallå")
    print(python)

    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    test = exec(python)
    print("hej")
    sys.stdout = old_stdout    
    print("hej")
    output = redirected_output.getvalue()
    print(output,test, 'output')
    return output


if __name__ == "__main__":
    main.toy_test()
