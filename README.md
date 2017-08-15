# online-chatting
muilti-person online chatting tool
Demo site: <http://ec2-34-211-12-188.us-west-2.compute.amazonaws.com>

Local install guide
=====
```
git clone https://github.com/edwardcgeorge/online-chatting.git
cd online-chatting
npm install
npm start
```
Enter this application through `http://localhost:8080`

Host on AWS guide
=====

To host on AWS, first launch an AWS EC2 instance using the *MEAN by Bitnami*, then SSH to that instance using:

    ssh -i path/to/ssh/key.pem bitnami@{public ip}

Install OuterCircle on host server using:

    git clone https://github.com/edwardcgeorge/online-chatting.git
    cd online-chatting
    ./run.sh
