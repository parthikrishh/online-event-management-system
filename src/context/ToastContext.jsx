/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children, onToastChange }) => {
    const showToast = (message, type = 'success') => {
        onToastChange({ message, type });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    );
};
