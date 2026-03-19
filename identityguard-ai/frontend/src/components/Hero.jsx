import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const Hero = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        // GSAP Scroll effect
        gsap.fromTo(heroRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
        );
    }, []);

    return (
        <div className="gradient-bg">
            <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center position-relative">
                <div className="row align-items-center w-100">
                    <div className="col-lg-8 mx-auto text-center" ref={heroRef}>
                        <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill">
                            🚀 Welcome to the Future of Identity
                        </span>
                        <h1 className="display-4 display-md-3 fw-bold mb-4">
                            Secure Your Platform with <br />
                            <span className="text-gradient">Biometric De-duplication</span>
                        </h1>
                        <p className="lead text-muted mb-5 px-lg-5">
                            IdentityGuard AI ensures one real human equals one account. We utilize advanced DeepFace embeddings to block duplicate registrations and spoofing attempts instantly.
                        </p>

                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                            <Link to="/register" className="btn btn-modern px-5 py-3 fs-5">
                                Register Identity
                            </Link>
                            <Link to="/verify" className="btn btn-modern-secondary px-5 py-3 fs-5 bg-white">
                                Verify Access
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
