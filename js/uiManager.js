// Inside gameLoop()
// ... Update Game State ...
if (gameManager) {
    gameManager.update(deltaTime);
}
if (uiManager) { // Add UIManager update
    uiManager.update(deltaTime);
}

// ... Rendering ...
ctx.clearRect(0, 0, canvas.width, canvas.height);
// ... fill background ...
if (gameManager) {
    gameManager.render(ctx);
}
if (uiManager) { // Add UIManager render (usually drawn last/on top)
    uiManager.render();
}
// ... requestAnimationFrame ...
