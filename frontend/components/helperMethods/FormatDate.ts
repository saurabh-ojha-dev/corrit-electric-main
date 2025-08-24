export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
};

// Calculate next payment date (monthly from creation date)
export const getNextPaymentDate = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();

    // Start with the creation date
    let nextPayment = new Date(createdDate);

    // Keep adding months until we find the next payment date
    while (nextPayment <= currentDate) {
        nextPayment.setMonth(nextPayment.getMonth() + 1);
    }

    return formatDate(nextPayment.toISOString());
};