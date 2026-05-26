export default function Footer() {
    return (
        <footer className="text-light p-4" style={{ backgroundColor: '#020617', borderTop: '1px solid #333' }}>
            <div className="container">
                    <h5 className="mb-2 border-bottom border-light pb-2">CAR RENTAL SERVICE</h5>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-between mt-3">
                        <p className="mb-0">&copy; 2026 Izabela Korzeniowska.</p>
                        <div className="d-flex mt-3 mt-md-0">
                            <a href="" className="text-light text-decoration-none me-3">Privacy Policy</a>
                            <a href="" className="text-light text-decoration-none">Terms of Service</a>
                        </div>
                    </div>

            </div>
        </footer>
    )
}