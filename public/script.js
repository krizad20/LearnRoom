const socket = io()
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
        // host: 'lms-peer-server.herokuapp.com',
        // port: '443'
    })
    // const myPeer = new Peer(undefined, {})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
var name;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId, userName) => {
        console.log(userName + ' Connect to this room')
        connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close()
            }
            console.log(userId)
        })
        // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            sendMessage(text)
        }
    });
    socket.on("createMessage", (message, userName) => {
        // $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);

        $(".chat-area").append(`<div class="message-wrapper">
        <div class="message-content">
            <p class="name">${userName}</p>
            <div class="message">${message}</div>
        </div>
    </div>`);
        scrollToBottom()
    })
})



myPeer.on('open', id => {
    name = prompt("What's your name?")
    socket.emit('join-room', ROOM_ID, id, name)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call

}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function sendMessage(text) {
    socket.emit('message', text.val());
    $(".chat-area").append(`<div class="message-wrapper reverse">
    <div class="message-content">
        <p class="name">` + name + `</p>
        <div class="message">${text.val()}</div>
        </div></div>`);
    scrollToBottom()
    text.val('')
}


const scrollToBottom = () => {
    var d = $('.chat-area');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    // console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span></span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span></span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span></span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span></span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}