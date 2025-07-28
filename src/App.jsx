import { useState, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { Toaster, toast } from 'react-hot-toast';
import { Sun, Moon } from 'lucide-react'; // ✅ ADDED ICONS

function App() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState('L');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const qrRef = useRef();

  const handleDownload = useCallback(async (format) => {
    try {
      const dataUrl = format === 'PNG' 
        ? await toPng(qrRef.current)
        : await toSvg(qrRef.current);

      const link = document.createElement('a');
      link.download = `qr-code.${format.toLowerCase()}`;
      link.href = dataUrl;
      link.click();

      toast.success(`Downloaded as ${format}`);
    } catch (err) {
      toast.error('Download failed');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const dataUrl = await toPng(qrRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Check out this QR code!'
        });
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (err) {
      toast.error('Sharing failed: not supported in this Desktop/Browser');
      console.log(err)
    }
  }, []);

  const handleCopyImage = async () => {
    if (qrRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dataUrl = await toPng(qrRef.current);
      const img = new Image();
      img.src = dataUrl;

      img.onload = async () => {
        ctx.drawImage(img, 0, 0, size, size);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            toast.success("Copied to clipboard!");
          } catch (err) {
            toast.error("Clipboard copy failed : not supported in this browser/ Desktop");
            console.error(err);
          }
        }, "image/png");
      };
    }
  };

  return (
    <div className={`min-h-screen px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">QR Code Generator</h1>

          {/* 🌞🌙 Dark Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
          <input
  type="text"
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Enter text or URL"
  className="w-full p-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>


            <div>
              <label className="block mb-1 text-sm">Size: {size}x{size}</label>
              <input
                type="range"
                min="128"
                max="512"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm">Foreground Color</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Background Color</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm">Error Correction Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeMargin}
                onChange={() => setIncludeMargin(!includeMargin)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm">Include Margin</span>
            </div>
          </div>

          <div className={`rounded-lg p-6 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-center mb-6 overflow-auto">
              <div ref={qrRef} style={{ width: size, height: size }}>
                <QRCodeCanvas
                  value={text || 'Enter Text'}
                  size={size}
                  level={level}
                  includeMargin={includeMargin}
                  fgColor={fgColor}
                  bgColor={bgColor}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => handleDownload('PNG')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Download PNG</button>
              <button onClick={() => handleDownload('SVG')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Download SVG</button>
              <button onClick={handleShare} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Share</button>
              <button onClick={handleCopyImage} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Copy QR</button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
