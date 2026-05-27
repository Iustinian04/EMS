export default function Card({ className = '', children }) {
    return (
        <div className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
            {children}
        </div>
    );
}
