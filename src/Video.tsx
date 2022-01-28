import React, {CSSProperties, useEffect, useRef} from "react"
import AgoraRTC, {IRemoteVideoTrack, ITrack} from "agora-rtc-sdk-ng"
import {APP_ID} from "./Settings";

export interface SmallVideoProps {
    onClick?: () => void
    onClose?: () => void
    lowStream?: boolean
    video:ITrack
}

const Video: React.FC<SmallVideoProps> = ({onClick,  onClose, lowStream = false,video}) => {
    const ref = useRef<HTMLDivElement>()
    useEffect(() => {
        video.play(ref.current!!)
    }, [video])

    return (<>
        <div ref={el => ref.current = el!!} style={{height: "100%", width: "100%"}} onClick={onClick}>

        </div>
    </>)
}

export default Video
