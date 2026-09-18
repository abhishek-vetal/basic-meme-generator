import { useState, useEffect, useRef } from "react"

const DEFAULT_MEMES = [
    { url: "https://i.imgflip.com/1bij.jpg", name: "One Does Not Simply" },
    { url: "https://i.imgflip.com/26am.jpg", name: "Ancient Aliens" },
    { url: "https://i.imgflip.com/1g8my4.jpg", name: "Two Buttons" },
    { url: "https://i.imgflip.com/1ur9b0.jpg", name: "Distracted Boyfriend" },
    { url: "https://i.imgflip.com/261o3j.jpg", name: "Buff Doge vs. Cheems" }
]

export default function Main() {
    const [meme, setMeme] = useState({
        topText: "One does not simply",
        bottomText: "Walk into Mordor",
        imageUrl: "https://i.imgflip.com/1bij.jpg"
    })
    const [allMemes, setAllMemes] = useState(DEFAULT_MEMES)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok")
                return res.json()
            })
            .then(data => {
                if (data?.data?.memes?.length) {
                    setAllMemes(data.data.memes)
                }
            })
            .catch(() => {
                // Fallback to default memes if API is blocked or unreachable
                setAllMemes(DEFAULT_MEMES)
            })
    }, [])

    function getMemeImage() {
        if (!allMemes.length) return
        const randomNumber = Math.floor(Math.random() * allMemes.length)
        const newMemeUrl = allMemes[randomNumber].url
        setMeme(prevMeme => ({
            ...prevMeme,
            imageUrl: newMemeUrl
        }))
    }

    function handleChange(event) {
        const { value, name } = event.currentTarget
        setMeme(prevMeme => ({
            ...prevMeme,
            [name]: value
        }))
    }

    function handleImageUpload(event) {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = e => {
                if (e.target?.result) {
                    setMeme(prev => ({
                        ...prev,
                        imageUrl: e.target.result
                    }))
                }
            }
            reader.readAsDataURL(file)
        }
    }

    function downloadMeme() {
        setLoading(true)
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = meme.imageUrl

        img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = img.naturalWidth || 600
            canvas.height = img.naturalHeight || 600
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                setLoading(false)
                return
            }

            // Draw meme image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            // Configure text styling
            const fontSize = Math.max(24, Math.floor(canvas.width / 12))
            ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`
            ctx.fillStyle = "white"
            ctx.strokeStyle = "black"
            ctx.lineWidth = Math.max(3, Math.floor(fontSize / 7))
            ctx.textAlign = "center"

            // Helper to render wrapped text
            function renderText(text, yPos, baseline) {
                if (!text) return
                ctx.textBaseline = baseline
                const maxWidth = canvas.width * 0.9
                const words = text.toUpperCase().split(" ")
                let line = ""
                const lines = []

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + " "
                    const metrics = ctx.measureText(testLine)
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(line.trim())
                        line = words[n] + " "
                    } else {
                        line = testLine
                    }
                }
                lines.push(line.trim())

                const lineHeight = fontSize * 1.15
                let currentY = yPos

                if (baseline === "bottom") {
                    currentY = yPos - (lines.length - 1) * lineHeight
                }

                lines.forEach(l => {
                    ctx.strokeText(l, canvas.width / 2, currentY)
                    ctx.fillText(l, canvas.width / 2, currentY)
                    currentY += lineHeight
                })
            }

            renderText(meme.topText, 25, "top")
            renderText(meme.bottomText, canvas.height - 25, "bottom")

            // Trigger download
            const link = document.createElement("a")
            link.download = "meme.png"
            link.href = canvas.toDataURL("image/png")
            link.click()
            setLoading(false)
        }

        img.onerror = () => {
            alert("Could not load image for download due to CORS restrictions. Try uploading an image or picking another template.")
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="form">
                <label>
                    Top Text
                    <input
                        type="text"
                        placeholder="One does not simply"
                        name="topText"
                        onChange={handleChange}
                        value={meme.topText}
                    />
                </label>

                <label>
                    Bottom Text
                    <input
                        type="text"
                        placeholder="Walk into Mordor"
                        name="bottomText"
                        onChange={handleChange}
                        value={meme.bottomText}
                    />
                </label>

                <div className="button-group">
                    <button type="button" className="btn btn-primary" onClick={getMemeImage}>
                        Get a new meme image 🖼
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload Image 📁
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: "none" }}
                    />
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={downloadMeme}
                        disabled={loading}
                    >
                        {loading ? "Preparing..." : "Download Meme 💾"}
                    </button>
                </div>
            </div>

            <div className="meme">
                <img src={meme.imageUrl} alt="Meme template" crossOrigin="anonymous" />
                <span className="top">{meme.topText}</span>
                <span className="bottom">{meme.bottomText}</span>
            </div>
        </main>
    )
}