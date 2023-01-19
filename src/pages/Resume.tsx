export function Resume() {
    return <div className="content">
        <h1>Resume</h1>
        <div className="item-centered">
            <embed src="../documents/Resume-2022-OctDev.pdf" width={window.innerWidth/2} height={window.innerHeight}
            type="application/pdf"></embed>
        </div>
    </div>
}