import { useEffect, useState } from "react";

import congratsImage from "../assets/image2.jpg";
import "./parabens.css";

const IMAGE_REVEAL_DELAY_SECONDS = 5;

const CONGRATS_IMAGE_URL = congratsImage;

export function ParabensPage() {
  const [showImage, setShowImage] = useState(false);
  const hasImage = Boolean(CONGRATS_IMAGE_URL.trim());

  useEffect(() => {
    const revealId = window.setTimeout(() => {
      setShowImage(true);
    }, IMAGE_REVEAL_DELAY_SECONDS * 1000);

    return () => window.clearTimeout(revealId);
  }, []);

  return (
    <main className="parabens-page">
      <section className="parabens-card">
        <p className="parabens-kicker">Etapa concluída</p>
        <h1>Parabéns, você é muito inteligente</h1>

        {!showImage && (
          <p className="parabens-wait">
            Aguarde {IMAGE_REVEAL_DELAY_SECONDS} segundos para ver a próxima
            imagem.
          </p>
        )}

        {showImage && (
          <div className="parabens-media">
            {hasImage ? (
              <img
                src={CONGRATS_IMAGE_URL}
                alt="Imagem especial após concluir o puzzle"
              />
            ) : (
              <div className="parabens-placeholder">
                <p>Espaço reservado para a próxima imagem.</p>
                <p>
                  Defina <code>CONGRATS_IMAGE_URL</code> em{" "}
                  <code>src/pages/parabens.jsx</code>.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
