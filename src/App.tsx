import React, {useEffect, useMemo, useRef, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ArRTC from "ar-rtc-sdk";
import Video from "./Video";
import video from "./Video";
import ArrayUtils from "./ArrayUtils";

function App() {
    const [selectedChannel, setSelectedChannel] = useState<string>()
    const [channelList, setChannelList] = useState<string[]>([])
    const primaryChannel = useMemo(() => {
        let channel = channelList.find(it => it === selectedChannel);
        if (channel) {
            return channel
        } else {
            return channelList[0]
        }
    }, [channelList, selectedChannel])
    const playList = channelList
    const [channel, setChannel] = useState("")
    return (
        <>
            {channelList}
            {playList}
            <div style={{height: "100vh", width: "100vw", display: "flex", flexDirection: "column"}}>
                <label htmlFor={"channel"}>
                    <span>Channel:</span>
                    <input value={channel} onChange={event => setChannel(event.target.value)} id={"channel"}
                           onKeyDown={event => {
                               if (event.key === "Enter") {
                                   setChannelList(channelList.concat([channel]))
                               }
                           }}/>
                </label>
                <div style={{
                    height: "80%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <div style={{height: "100%", width: "80%"}}>
                        {primaryChannel ? <Video channel={primaryChannel} key={primaryChannel}/> : null}
                    </div>
                    <div style={{height: "100%", width: "20%", display: "flex", flexDirection: "column"}}>
                        {playList.map(item => {
                            return (
                                <div style={{height: "25%", width: "100%", border: "1px solid green"}} key={item}><Video
                                    lowStream
                                    channel={item} onClick={() => setSelectedChannel(item)}
                                    onClose={() => {
                                        let arr = Array.from(channelList);
                                        ArrayUtils.remove(arr,item)
                                        setChannelList(arr);
                                    }}/>
                                </div>)
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
