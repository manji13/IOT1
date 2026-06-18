const fs = require('fs');
const path = require('path');

exports.getFilterUnits = (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'seeds', 'Filter_units.json');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Filter units data not found'
            });
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        res.status(200).json({
            success: true,
            data: JSON.parse(data)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getFilterUnitsGrouped = (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'seeds', 'Filter_units_grouped.json');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Grouped filter units data not found'
            });
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        res.status(200).json({
            success: true,
            data: JSON.parse(data)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
