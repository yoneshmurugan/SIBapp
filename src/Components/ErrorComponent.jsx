const ErrorComponent = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
                <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-spin"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-4xl font-bold transform rotate-45">+</span>
                </div>
                
                <div className="absolute w-full h-full border-4 border-red-300 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
};

export default ErrorComponent;