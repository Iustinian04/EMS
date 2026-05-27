export default function EmptyState({ title, description, action }) {
    return (
        <div className="text-center py-12 px-6 bg-gray-50 border border-dashed border-gray-300 rounded-xl dark:bg-gray-800/50 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
            {action}
        </div>
    );
}
