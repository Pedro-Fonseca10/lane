import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import coupleImage from "../assets/image.jpg";
import "./puzzle.css";

const GRID_OPTIONS = [3, 4, 5];
const DEFAULT_GRID_SIZE = 3;
const NEXT_PAGE_PATH = "/parabens";
const NEXT_PAGE_DELAY_SECONDS = 5;

const PUZZLE_IMAGE_URL = coupleImage;

function createSolvedPieces(size) {
  return Array.from({ length: size * size }, (_, index) => index);
}

function shufflePieces(pieces) {
  const shuffled = [...pieces];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  const isSolved = shuffled.every((piece, index) => piece === index);
  if (isSolved && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function Puzzle() {
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [pieces, setPieces] = useState(() =>
    shufflePieces(createSolvedPieces(DEFAULT_GRID_SIZE)),
  );
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [imageRatio, setImageRatio] = useState(1);

  const hasCustomImage = Boolean(PUZZLE_IMAGE_URL.trim());
  const totalSlots = gridSize * gridSize;

  const isSolved = useMemo(
    () => pieces.every((piece, index) => piece === index),
    [pieces],
  );

  const startNewGame = useCallback(
    (size = gridSize) => {
      setPieces(shufflePieces(createSolvedPieces(size)));
      setSelectedIndex(null);
      setMoves(0);
      setSeconds(0);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [gridSize],
  );

  function handleGridSizeChange(event) {
    const nextGridSize = Number(event.target.value);
    setGridSize(nextGridSize);
    startNewGame(nextGridSize);
  }

  // function showSolvedBoard() {
  //   setPieces(createSolvedPieces(gridSize));
  //   setSelectedIndex(null);
  //   setDraggedIndex(null);
  //   setDragOverIndex(null);
  // }

  function swapTiles(firstIndex, secondIndex) {
    if (firstIndex === secondIndex) return;

    setPieces((currentPieces) => {
      const nextPieces = [...currentPieces];
      [nextPieces[firstIndex], nextPieces[secondIndex]] = [
        nextPieces[secondIndex],
        nextPieces[firstIndex],
      ];
      return nextPieces;
    });
    setMoves((currentMoves) => currentMoves + 1);
    setSelectedIndex(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleTileClick(index) {
    if (isSolved) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    swapTiles(selectedIndex, index);
  }

  function getDraggedIndexFromEvent(event) {
    const rawValue = event.dataTransfer.getData("text/plain");
    const parsedValue = Number(rawValue);

    if (!Number.isInteger(parsedValue)) return null;
    return parsedValue;
  }

  function handleTileDragStart(event, index) {
    if (isSolved) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    setDraggedIndex(index);
  }

  function handleTileDragOver(event, index) {
    const sourceIndex = draggedIndex ?? getDraggedIndexFromEvent(event);
    if (sourceIndex === null || sourceIndex === index) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleTileDragLeave(index) {
    setDragOverIndex((currentIndex) =>
      currentIndex === index ? null : currentIndex,
    );
  }

  function handleTileDrop(event, index) {
    event.preventDefault();
    const sourceIndex = draggedIndex ?? getDraggedIndexFromEvent(event);
    setDragOverIndex(null);

    if (sourceIndex === null || sourceIndex === index || isSolved) {
      setDraggedIndex(null);
      return;
    }

    swapTiles(sourceIndex, index);
  }

  function handleTileDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;

    setImageRatio(naturalWidth / naturalHeight);
  };

  useEffect(() => {
    if (isSolved) return undefined;

    const timerId = window.setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isSolved]);

  useEffect(() => {
    if (!isSolved) return undefined;

    const redirectId = window.setTimeout(() => {
      navigate(NEXT_PAGE_PATH);
    }, NEXT_PAGE_DELAY_SECONDS * 1000);

    return () => window.clearTimeout(redirectId);
  }, [isSolved, navigate]);

  return (
    <main className="puzzle-page">
      <section className="puzzle-shell">
        <aside className="puzzle-panel">
          <p className="puzzle-kicker">Quebra-cabeça</p>
          <h1>Troque duas peças para reconstruir a foto</h1>
          <p className="puzzle-description">
            Clique em uma peça e depois em outra para trocar de lugar.
          </p>

          <div className="puzzle-image-slot">
            {hasCustomImage ? (
              <img
                className="puzzle-preview-image"
                src={PUZZLE_IMAGE_URL}
                onLoad={handleImageLoad}
                alt="Imagem base do quebra-cabeça"
                style={{ "--board-ratio": String(imageRatio) }}
              />
            ) : (
              <div className="puzzle-image-placeholder">
                <p>Espaço reservado para sua imagem.</p>
                <p>
                  Defina <code>PUZZLE_IMAGE_URL</code> em{" "}
                  <code>src/pages/puzzle.jsx</code>.
                </p>
              </div>
            )}
          </div>

          <div className="puzzle-controls">
            <label htmlFor="grid-size">Dificuldade</label>
            <select
              id="grid-size"
              value={gridSize}
              onChange={handleGridSizeChange}
            >
              {GRID_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} x {size}
                </option>
              ))}
            </select>

            <div className="puzzle-actions">
              <button type="button" onClick={() => startNewGame()}>
                Embaralhar
              </button>
              {/* <button
                type="button"
                className="secondary"
                onClick={showSolvedBoard}
              >
                Resolver
              </button> */}
            </div>
          </div>
        </aside>

        <section className="puzzle-board-area">
          <header className="puzzle-status">
            <p>
              <span>Movimentos</span>
              <strong>{moves}</strong>
            </p>
            <p>
              <span>Tempo</span>
              <strong>{formatDuration(seconds)}</strong>
            </p>
            <p>
              <span>Tamanho</span>
              <strong>
                {gridSize} x {gridSize}
              </strong>
            </p>
          </header>

          <div
            className="puzzle-board"
            style={{
              "--grid-size": String(gridSize),
              "--board-ratio": String(imageRatio),
            }}
          >
            {pieces.map((piece, index) => {
              const row = Math.floor(piece / gridSize);
              const column = piece % gridSize;
              const backgroundX =
                gridSize > 1 ? (column / (gridSize - 1)) * 100 : 0;
              const backgroundY =
                gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

              return (
                <button
                  key={`${piece}`}
                  type="button"
                  draggable={!isSolved}
                  onDragStart={(event) => handleTileDragStart(event, index)}
                  onDragOver={(event) => handleTileDragOver(event, index)}
                  onDragLeave={() => handleTileDragLeave(index)}
                  onDrop={(event) => handleTileDrop(event, index)}
                  onDragEnd={handleTileDragEnd}
                  onClick={() => handleTileClick(index)}
                  aria-label={`Peça ${piece + 1}`}
                  className={`puzzle-tile ${hasCustomImage ? "with-image" : "without-image"} ${selectedIndex === index ? "selected" : ""} ${draggedIndex === index ? "dragging" : ""} ${dragOverIndex === index ? "drop-target" : ""}`}
                  style={{
                    "--piece-hue": String(
                      Math.round((piece / totalSlots) * 360),
                    ),
                    backgroundImage: hasCustomImage
                      ? `url(${PUZZLE_IMAGE_URL})`
                      : undefined,
                    backgroundSize: hasCustomImage
                      ? `${gridSize * 100}% ${gridSize * 100}%`
                      : undefined,
                    backgroundPosition: hasCustomImage
                      ? `${backgroundX}% ${backgroundY}%`
                      : undefined,
                  }}
                >
                  <span>{piece + 1}</span>
                </button>
              );
            })}
          </div>

          {isSolved && (
            <p className="puzzle-win">
              Perfeito! Puzzle concluído em {moves} movimentos. Redirecionando
              em {NEXT_PAGE_DELAY_SECONDS} segundos.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
