import { createContext, useReducer, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    role: null, // 'TEACHER' or 'BATCH'
};

const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
                role: action.payload.role
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
                role: action.payload.user.role
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                role: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User Helper
    const loadUser = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry?
                if (decoded.exp * 1000 < Date.now()) {
                    dispatch({ type: 'LOGOUT' });
                    return;
                }
                dispatch({ type: 'USER_LOADED', payload: decoded });
            } catch (err) {
                dispatch({ type: 'AUTH_ERROR' });
            }
        } else {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Login Teacher
    const loginTeacher = async (formData) => {
        try {
            const res = await api.post('/auth/teacher/login', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });
            return true;
        } catch (err) {
            dispatch({ type: 'LOGIN_FAIL' });
            return false;
        }
    };

    // Register Teacher
    const registerTeacher = async (formData) => {
        try {
            const res = await api.post('/auth/teacher/register', formData);
            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });
            return true;
        } catch (err) {
            dispatch({ type: 'LOGIN_FAIL' }); // Simplify fail state
            return false;
        }
    };

    // Login Batch
    const loginBatch = async (formData) => {
        try {
            const res = await api.post('/auth/batch/login', formData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });
            return true;
        } catch (err) {
            dispatch({ type: 'LOGIN_FAIL' });
            return false;
        }
    };

    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                role: state.role,
                loginTeacher,
                registerTeacher,
                loginBatch,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
