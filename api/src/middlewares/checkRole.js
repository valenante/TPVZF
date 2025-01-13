export const checkRole = (rolesPermitidos) => (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.role)) {
        return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }
    next();
};
