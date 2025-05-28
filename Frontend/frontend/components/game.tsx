"use client";
import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 300,
      parent: gameRef.current!,
      backgroundColor: "#222",
      scene: {
        preload() {
          this.load.setBaseURL('https://labs.phaser.io');
          this.load.image('sky', 'assets/skies/space3.png');
          this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        },
        create() {
          this.add.image(200, 150, 'sky');
          const logo = this.add.image(200, 150, 'logo');
          this.tweens.add({
            targets: logo,
            y: 250,
            duration: 1500,
            ease: 'Power2',
            yoyo: true,
            loop: -1
          });
        }
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      // Destruye el juego y su contexto correctamente
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
      if (gameRef.current) {
        gameRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={gameRef} />;
}