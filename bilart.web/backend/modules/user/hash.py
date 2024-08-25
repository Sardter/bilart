import base64

def hash_password(x: str) -> str:
    #return x
    return base64.b64encode(x.encode('utf-8')).decode('utf-8')
    # return bcrypt.hashpw(x.encode('utf-8'), salt).decode('utf-8')