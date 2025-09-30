export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    planning: 'blue',
    on_going: 'orange',
    completed: 'green',
  };
  return statusMap[status] || 'default';
};

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    planning: 'Planning',
    on_going: 'On Going',
    completed: 'Completed',
  };
  return labelMap[status] || status;
};

export const formatDateRange = (startDate?: string, endDate?: string, createdAt?: string): string => {
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (startDate || endDate) {
    const start = startDate ? formatDate(startDate) : '...';
    const end = endDate ? formatDate(endDate) : '...';
    return `${start} - ${end}`;
  }
  
  if (createdAt) {
    return formatDate(createdAt);
  }

  return 'Recent';
};
