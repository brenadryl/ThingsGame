import React from "react";
import { Player } from "../types";
import DetectiveCard from "./SuperlativeCards/DetectiveCard";
import CelebrityCard from "./SuperlativeCards/CelebrityCard";
import CheerleaderCard from "./SuperlativeCards/CheerleaderCard";
import SecretAgentCard from "./SuperlativeCards/SecretAgentCard";
import TargetCard from "./SuperlativeCards/TargetCard";
import RobotCard from "./SuperlativeCards/RobotCard";
import MirrorCard from "./SuperlativeCards/MirrorCard";
import NovelistCard from "./SuperlativeCards/NovelistCard";
import BrevityCard from "./SuperlativeCards/BrevityCard";
import CluelessCard from "./SuperlativeCards/CluelessCard";
import SpeedCard from "./SuperlativeCards/SpeedCard";
import BufferingCard from "./SuperlativeCards/BufferingCard";
import AwardCard from "./AwardCard";

interface AwardDisplayProps {
  player: Player;
  superlative: string;
}

const AwardDisplay: React.FC<AwardDisplayProps> = ({ player, superlative }) => {
    const key = `${player._id}-${superlative}`;

    if (superlative === "detective") {
        return (
            <AwardCard key={key} title="THE DETECTIVE" description="THE MOST ACCURATE GUESSER">
                <DetectiveCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "celebrity") {
        return (
            <AwardCard key={key} title="THE CELEBRITY" description="EVERYONE LOVES THEIR RESPONSES">
                <CelebrityCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "cheerleader") {
        return (
            <AwardCard key={key} title="THE CHEERLEADER" description="LIKES EVERYONE">
                <CheerleaderCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "agent") {
        return (
            <AwardCard key={key} title="THE SECRET AGENT" description="NO ONE CAN GUESS WHAT THEY WROTE">
                <SecretAgentCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "target") {
        return (
            <AwardCard key={key} title="THE EASY TARGET" description="THE EASIEST PLAYER TO GUESS">
                <TargetCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "robot") {
        return (
            <AwardCard key={key} title="PROBS A BOT" description="THE BLANDEST ANSWERS">
                <RobotCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "mirror") {
        return (
            <AwardCard key={key} title="THE CASANOVA" description="NOBODY LOVES THEM LIKE THEY DO">
                <MirrorCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "novelist") {
        return (
            <AwardCard key={key} title="THE NOVELIST" description="THE ABSOLUTE LONGEST ANSWERS">
                <NovelistCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "brevity") {
        return (
            <AwardCard key={key} title="THE ONE WORD WONDER" description="THE ABSOLUTE SHORTEST ANSWERS">
                <BrevityCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "clueless") {
        return (
            <AwardCard key={key} title="THE WHITLESS WONDER" description="COULDN'T GUESS RIGHT IF THEIR LIFE DEPENDED ON IT">
                <CluelessCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "speed") {
        return (
            <AwardCard key={key} title="THE KEYBOARD CHEETAH" description="THE FASTEST RESPONSE TIME">
                <SpeedCard player={player} />
            </AwardCard>
        )
    } else if (superlative === "buffering") {
        return (
            <AwardCard key={key} title="STILL BUFFERING" description="THE ABSOLUTE SLOWEST RESPONSE TIME">
                <BufferingCard player={player} />
            </AwardCard>
        )
    }

    return (<></>);
};

export default AwardDisplay;