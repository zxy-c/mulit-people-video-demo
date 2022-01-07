import React, {CSSProperties, useEffect, useRef} from "react"
import ArRTC from "ar-rtc-sdk";

export interface SmallVideoProps {
    onClick?: () => void
    channel:string
    onClose?:()=>void
    lowStream?:boolean
}

const Video: React.FC<SmallVideoProps> = ({onClick, channel,onClose,lowStream=false}) => {
    const ref = useRef<HTMLDivElement>()
    useEffect(() => {
        const arRTCClient = ArRTC.createClient({mode: "live", codec: "h264", role: "audience"});
        arRTCClient.join("540a416d66908f6799b9d1da3c8b4162",channel,null,null).then(()=>{
            arRTCClient.on("user-published", async (user, mediaType) => {
                try {
                    await arRTCClient.setRemoteVideoStreamType(user.uid, lowStream ? 1 : 0)
                } catch (e) {
                    console.error(e)
                }
                await arRTCClient.subscribe(user,mediaType)
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
                console.log("unpublish",user,mediaType,onClose)
                if (mediaType==="video"){
                    onClose&&onClose()
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
