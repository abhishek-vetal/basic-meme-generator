import trollFace from "../images/troll-face.png"

export default function Header() {
    return (
        <header className="header">
            <img 
                src={trollFace} 
                alt="Troll Face"
                className="header--image"
            />
            <h1 className="header--title">Meme Generator</h1>
            <h4 className="header--project">React Project</h4>
        </header>
    )
}