import React, { useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { Player } from "../types";
import PlayerCard from "./PlayerCards";
import { shallowEqual } from "../utils/gameUtils";
import { useGameStore } from "../stores/useGameStore";

interface PlayerTurnCarouselProps {
  players: Player[];
  playerId: string;
}

const PlayerTurnCarousel: React.FC<PlayerTurnCarouselProps> = ({ players}) => {
    const gagList = useGameStore((state) => state.gagList)
    const currentPlayerTurn = useGameStore((state) => state.currentTurnPlayer)
    const myTurn = useGameStore((state) => state.myTurn)

    const containerRef = useRef<HTMLDivElement | null>(null);
    const selectedRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => { 
        if (containerRef.current && selectedRef.current) {
            const container = containerRef.current;
            const selected = selectedRef.current;
            const containerCenter = container.offsetWidth / 2;
            const selectedCenter = selected.offsetLeft + selected.offsetWidth / 2;
            container.scrollTo({
                left: selectedCenter - containerCenter,
                behavior: "smooth", // Ensures smooth scrolling
            })
        }
    }, [currentPlayerTurn])

    return (
        <Box
            ref={containerRef}
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                overflowX: "auto",
                gap: myTurn ? "2px" : "24px",
                paddingY: "8px",
                marginY: "8px",
                paddingX:"16px",
                whitespace: "nowrap",
                scrollBehavior: "smooth",
                height: myTurn ? "115px" : "150px",
                width: "100vw",
                maxWidth: "100%",
            }}
        >
            {players.map((player, index) => {
                const gag = gagList.find((gag) => gag.player._id === player._id)
                const currentTurn = currentPlayerTurn?._id === player._id;
                return (
                    <Box 
                        ref={currentPlayerTurn?._id === player._id ? selectedRef : null}
                        key={player._id}
                        marginLeft={index === 0 ? "50px" : "0px"}
                        sx={{
                            maxWidth: "90px",
                            transform: currentPlayerTurn?._id === player._id ? "scale(1.2)" : "scale(1.0)",
                            transition: "transform 0.3s ease-in-out",
                        }}
                    >
                        <Button
                            key={player._id}
                            sx={{ 
                                pointerEvents: "none",
                                maxWidth: "80px",
                                padding: 0,
                                opacity: !gag || gag.guessed || !currentTurn ? 0.3 : 1,
                                borderRadius: 3,
                                width: '130px',
                            }}
                        >
                            <PlayerCard name={player?.name || ''} color={!gag || gag.guessed ? "grey" : player?.color || ''} icon={player?.icon} emotion={!gag || gag.guessed ? "sad" : (currentTurn ? "happy" : "neutral")} mini={!currentTurn} isStandard={!myTurn} />
                        </Button>
                    </Box>
                )
            })}
        </Box>
    );
};

export default React.memo(PlayerTurnCarousel, (prev, next) => {
    return (
        shallowEqual(prev.players, next.players)
    )
});