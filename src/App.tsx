import React, {useEffect, useMemo, useRef, useState} from 'react';
import './App.css';
import Video from "./Video";
import AgoraRTC, {IAgoraRTCRemoteUser, ICameraVideoTrack} from "agora-rtc-sdk-ng";
import {APP_ID} from "./Settings";
import AgoraRTM from "agora-rtm-sdk"

interface Message {
    memberId: string
    text?: string
    image?: string
}

function App() {
    const agoraRTC = useMemo(() => {
        return AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    }, [])
    const [channel, setChannel] = useState("")
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([])
    const [currentChannel, setCurrentChannel] = useState<string>()
    const [account, setAccount] = useState("")
    const [primaryVideo, setPrimaryVideo] = useState<ICameraVideoTrack>()
    let agoraRTM = useMemo(() => {
        return AgoraRTM.createInstance(APP_ID);
    }, [])
    const [rtmChannel, setRtmChannel] = useState<any>()
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState("")
    let messageContainerRef = useRef<HTMLDivElement | null>();
    useEffect(() => {
        let handler = (message: any, memberId: string) => {
            if (message.messageType === "TEXT") {
                pushMessage({memberId, text: message.text})
            } else if (message.messageType === "IMAGE") {
                let fileReader = new FileReader();
                fileReader.readAsDataURL(message.thumbnail);
                fileReader.onload = ev => {
                    pushMessage({memberId, image: fileReader.result as string})
                }
            }
        };
        rtmChannel?.on("ChannelMessage", handler)
        return () => {
            rtmChannel?.off("ChannelMessage", handler)
        }
    }, [rtmChannel, messages])

    function pushMessage(message: Message) {
        const array = Array.from(messages)
        array.push(message)
        setMessages(array)
        messageContainerRef.current?.scrollTo({top: messageContainerRef.current!!.scrollHeight})
    }

    function joinChannel() {
        agoraRTC.join(APP_ID, channel, null,).then(async () => {
            setCurrentChannel(channel)
            const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setPrimaryVideo(cameraTrack)
            await agoraRTC.publish([cameraTrack, microphoneTrack])
            await agoraRTM.login({uid: account})
            let rtmChannel = agoraRTM.createChannel(channel);
            setRtmChannel(rtmChannel)
            await rtmChannel.join()
            agoraRTC.remoteUsers.forEach(u => {
                if (u.hasVideo) {
                    agoraRTC.subscribe(u, "video").then(track => {
                        const array = Array.from(users)
                        array.push(u)
                        setUsers(array)
                    })
                }
                if (u.hasAudio) {
                    agoraRTC.subscribe(u, "audio").then(track => {
                        track.play()
                    })
                }
            })

            agoraRTC.on("user-published", async (user, mediaType) => {
                const lowStream = true
                try {
                    await agoraRTC.setRemoteVideoStreamType(user.uid, lowStream ? 1 : 0)
                } catch (e) {
                    console.error(e)
                }

                agoraRTC.subscribe(user, mediaType).then(() => {
                    if (mediaType === "video" && user.videoTrack) {
                        const array = Array.from(users)
                        array.push(user)
                        setUsers(array)
                    }
                    if (mediaType === "audio") {
                        user.audioTrack?.play()
                    }
                })
            })
            agoraRTC.on("user-unpublished", (user, mediaType) => {
                console.log("unpublish", user, mediaType)
                const array = Array.from(users)
                users.splice(array.findIndex(it => it.uid === user.uid), 1)
                setUsers(array)
            })
        })
    }

    return (
        <>

            <div style={{height: "100vh", width: "100vw", display: "flex", flexDirection: "column"}}>
                {currentChannel ?
                    <div style={{height: 36}}>{`Current Channel:${currentChannel} Your Account:${account}`}</div> : <>
                        <><label htmlFor={"channel"}>
                            <span>Channel:</span>
                            <input value={channel} onChange={event => setChannel(event.target.value)} id={"channel"}
                            />
                        </label>
                            <label htmlFor={"account"}>
                                <span>Account:</span>
                                <input value={account} onChange={event => setAccount(event.target.value)} id={"account"}
                                />
                            </label>
                            <button onClick={joinChannel}>Join</button>
                        </>
                    </>}

                <div style={{
                    height: "80%",
                    width: "100%",
                    display: "flex",
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <div style={{height: "100%", width: "80%"}}>
                        {primaryVideo ? <Video video={primaryVideo}/> : null}
                    </div>
                    <div style={{height: "100%", width: "20%", display: "flex", flexDirection: "column"}}>
                        {users.map(item => {

                            return (
                                <div style={{height: "25%", width: "100%", border: "1px solid green"}} key={item.uid}>
                                    <Video
                                        video={item.videoTrack!!}
                                    />
                                </div>)
                        })}
                    </div>
                </div>
                {rtmChannel ? <div style={{display: "flex", height: "calc(20vh - 36px)"}}>
                    <div style={{overflowY: "auto", flex: 1}} ref={ref => messageContainerRef.current = ref}>
                        {messages.map((log, index) => {
                            if (log.image){
                                return <div> {log.memberId}: <img src={log.image} key={index}/></div>
                            }else {
                                return <p key={index}>{log.memberId}: {log.text}</p>
                            }
                        })}
                    </div>
                    <div style={{alignSelf: "center"}}>
                        <input value={message} onChange={event => setMessage(event.target.value)} placeholder={""}/>
                        <button onClick={async () => {
                            if (message) {
                                await rtmChannel.sendMessage({text: message})
                                pushMessage({memberId: account, text: message})
                                setMessage("")
                            }
                        }}>Send
                        </button>
                        <label htmlFor={"sendFileInput"}>
                                Send File
                            <input type={"file"} id={"sendFileInput"} style={{width: 0, height: 0}}
                                   onChange={(event) => {
                                       let file = (event.target.files || [])[0];
                                       let fileReader = new FileReader();
                                       fileReader.onload = () => {
                                           console.log("onload")
                                           let result = fileReader.result as string;
                                           let image = new Image();
                                           image.onload = ev => {
                                               agoraRTM.createMediaMessageByUploading(file, {
                                                   messageType: "IMAGE",
                                                   fileName: "agora.jpg",
                                                   description: "test",
                                                   thumbnail: file,
                                                   width: image.width,
                                                   height: image.height,
                                                   thumbnailWidth: 50,
                                                   thumbnailHeight: 50
                                               }).then(mediaMessage => {
                                                   let imageMessage = agoraRTM.createMessage({
                                                       messageType: "IMAGE",
                                                       mediaId: mediaMessage.mediaId,
                                                       fileName:"example.jpg",
                                                       description:"send image",
                                                       thumbnail:file,
                                                       width: image.width,
                                                       height: image.height,
                                                       thumbnailWidth: 50,
                                                       thumbnailHeight: 50
                                                   });
                                                       rtmChannel.sendMessage(imageMessage).then(()=>{
                                                           pushMessage({memberId:account,image:result})
                                                       })
                                               })
                                           }
                                           image.src = result

                                       }
                                       fileReader.readAsDataURL(file)

                                   }}/>
                        </label>
                    </div>
                </div> : null}

            </div>
        </>
    );
}

export default App;
