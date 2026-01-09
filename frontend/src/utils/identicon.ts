// Simple identicon generator for Ethereum addresses
export function generateIdenticon(address: string, size: number = 40): string {
  // Normalize address
  const addr = address.toLowerCase().replace('0x', '');

  // Create a simple 5x5 grid pattern based on address hash
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Background color from first 6 characters
  const bgColor = `#${addr.substring(0, 6)}`;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Foreground color (complementary or lighter version)
  const r = parseInt(addr.substring(0, 2), 16);
  const g = parseInt(addr.substring(2, 4), 16);
  const b = parseInt(addr.substring(4, 6), 16);

  // Calculate complementary color
  const fgColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  ctx.fillStyle = fgColor;

  // Draw pattern based on address
  const gridSize = 5;
  const cellSize = size / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Mirror horizontally for symmetry
      const col = j < 3 ? j : 4 - j;
      const index = i * 3 + col;

      // Use address bytes to determine if cell should be filled
      const byte = parseInt(addr.charAt(index % addr.length) + addr.charAt((index + 1) % addr.length), 16);

      if (byte % 2 === 0) {
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL();
}

// Generate a color for an address (for simple circular avatars)
export function getAddressColor(address: string): string {
  const addr = address.toLowerCase().replace('0x', '');
  return `#${addr.substring(0, 6)}`;
}

// Get initials from address (first 2 chars after 0x)
export function getAddressInitials(address: string): string {
  return address.substring(2, 4).toUpperCase();
}
