import React, {useEffect, useMemo, useRef, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import ArRTC from "ar-rtc-sdk";
import Video from "./Video";
import video from "./Video";
import ArrayUtils from "./ArrayUtils";

function App() {
    const [selectedChannel, setSelectedChannel] = useState<string>()
    const [channelList, setChannelList] = useState<Map<string,string>>(new Map())
    const primaryChannel = useMemo(() => {
        let strings = Array.from(channelList.keys());
        let channel = strings.find(it => it === selectedChannel);
        if (channel) {
            return channel
        } else {
            return strings[0]
        }
    }, [channelList, selectedChannel])
    const playList = channelList
    const [channel, setChannel] = useState("")
    const [token,setToken]=useState("")
    return (
        <>

            <div style={{height: "100vh", width: "100vw", display: "flex", flexDirection: "column"}}>
                {channelList.entries()}
                <label htmlFor={"channel"}>
                    <span>Channel:</span>
                    <input value={channel} onChange={event => setChannel(event.target.value)} id={"channel"}
                           onKeyDown={event => {
                               if (event.key === "Enter") {
                                   setChannelList(new Map(channelList).set(channel,token))
                               }
                           }}/>
                </label>
                <label htmlFor={"token"}>
                    <span>Token:</span>
                    <input value={token} onChange={event => setToken(event.target.value)} id={"token"}
                           onKeyDown={event => {
                               if (event.key === "Enter") {
                                   setChannelList(new Map(channelList).set(channel,token))
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
                        {primaryChannel ? <Video channel={primaryChannel} token={channelList.get(primaryChannel)!!} key={primaryChannel}/> : null}
                    </div>
                    <div style={{height: "100%", width: "20%", display: "flex", flexDirection: "column"}}>
                        {Array.from(playList.entries()).map(item => {

                            return (
                                <div style={{height: "25%", width: "100%", border: "1px solid green"}} key={item[0]}><Video
                                    lowStream
                                    channel={item[0]} onClick={() => setSelectedChannel(item[0])}
                                    token={item[1]}
                                    onClose={() => {
                                        let newMap = new Map(channelList.entries());
                                        newMap.delete(item[0])
                                        setChannelList(newMap)
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
