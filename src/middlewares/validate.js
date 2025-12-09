import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // CORRECTION : On ne remplace QUE le body (pour les Dates)
        // On ne touche pas à query et params car Express 5 l'interdit (getter only)
        req.body = parsed.body;

        // Note : Tes services font déjà "Number(id)" ou "Number(page)", 
        // donc pas besoin de forcer la conversion ici pour query/params.

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodErrors = error.errors || error.issues;

            const formattedErrors = zodErrors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Erreur de validation des données',
                errors: formattedErrors,
            });
        }
        next(error);
    }
};