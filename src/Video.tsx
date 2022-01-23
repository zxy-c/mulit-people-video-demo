import React, {CSSProperties, useEffect, useRef} from "react"
import AgoraRTC from "agora-rtc-sdk-ng"

export interface SmallVideoProps {
    onClick?: () => void
    channel: string
    token:string
    onClose?: () => void
    lowStream?: boolean
}

const Video: React.FC<SmallVideoProps> = ({onClick, channel, onClose, lowStream = false,token}) => {
    const ref = useRef<HTMLDivElement>()
    useEffect(() => {
        const arRTCClient = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
        arRTCClient.join("c4782cc757fb41ecbe291be853a5394c", channel, token,).then(() => {
            arRTCClient.on("user-published", async (user, mediaType) => {
                try {
                    await arRTCClient.setRemoteVideoStreamType(user.uid, lowStream ? 1 : 0)
                } catch (e) {
                    console.error(e)
                }
                await arRTCClient.subscribe(user, mediaType)
                arRTCClient.subscribe(user, mediaType).then(() => {
                    if (mediaType === "video") {
                        user.videoTrack?.play(ref.current!!)
                    }
                    if (mediaType === "audio") {
                        user.audioTrack?.play()
                    }
                })
            })
            arRTCClient.on("user-unpublished", (user, mediaType) => {
                console.log("unpublish", user, mediaType, onClose)
                if (mediaType === "video") {
                    onClose && onClose()
                }
            })
        })
    }, [channel])

    return (<>
        <div ref={el => ref.current = el!!} style={{height: "100%", width: "100%"}} onClick={onClick}>

        </div>
    </>)
}

export default Video
