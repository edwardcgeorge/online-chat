# online-chat

This is a multi-person live chat web app.
* Webpage developed by HTML/CSS & Bootstrap, server by express.js
* Using socket.io for real-time communication

Demo site: <https://safe-reef-43552.herokuapp.com/>

### Local install guide

To install on local machine, run these commands:
```
git clone https://github.com/edwardcgeorge/online-chatting.git
cd online-chatting
npm install
npm start
```
Enter this application through `http://localhost:8080`

### Host on AWS guide

To host on AWS, first launch an *AWS EC2* instance using the *MEAN by Bitnami*, then SSH to that instance using:

    ssh -i path/to/ssh/key.pem bitnami@{public ip}

First, open *server.js* and add **your own mongodb password** on host server to line 19

Install on host server using:

    git clone https://github.com/edwardcgeorge/online-chatting.git
    cd online-chatting
    ./run.sh
