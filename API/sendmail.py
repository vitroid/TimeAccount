# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
import os

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def mail(to, subject, body, api_key):
    message = Mail(
        from_email='vitroid@gmail.com',
        to_emails=to,
        subject=subject,
        html_content=body
    )
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e.message)
