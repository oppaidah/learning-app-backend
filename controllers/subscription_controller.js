const pool = require('../config/db');

// Get a list of all available subscription plans
exports.getSubscriptionPlans = async (req, res) => {
    try {
        const [plans] = await pool.execute('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
        // Parse the features string back into an array for each plan
        const plansWithFeatures = plans.map(plan => ({
            ...plan,
            features: JSON.parse(plan.features || '[]')
        }));
        res.status(200).json(plansWithFeatures);
    } catch (error) {
        console.error("Get Subscription Plans Error:", error);
        res.status(500).json({ message: "Server error while fetching subscription plans." });
    }
};

// --- Function to update a user's subscription ---
exports.updateSubscription = async (req, res) => {
    try {
        const { planName } = req.body; // e.g., "Premium"
        const userId = req.userData.userId; // From the auth middleware

        if (!planName || !['Basic', 'Pro', 'Premium'].includes(planName)) {
            return res.status(400).json({ message: 'A valid plan name is required.' });
        }
        
        // Update the user's status in the database
        await pool.execute(
            'UPDATE users SET subscription_status = ? WHERE id = ?',
            [planName, userId]
        );

        res.status(200).json({ message: `Successfully subscribed to the ${planName} plan!` });

    } catch (error) {
        console.error("Update Subscription Error:", error);
        res.status(500).json({ message: "Server error while updating subscription." });
    }
};