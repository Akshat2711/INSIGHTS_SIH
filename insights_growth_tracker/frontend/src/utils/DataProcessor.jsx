// Enhanced Data Processing Utilities
export class DataProcessor {
  static processTimelineData(data) {
    const timelineEvents = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Process all metric types with timestamps
    const metricsWithTimestamps = [
      ...(data.post_to_no?.hackathon || []).map(item => ({
        ...item, 
        type: 'hackathon', 
        category: 'Competition',
        icon: 'trophy'
      })),
      ...(data.post_to_no?.internship || []).map(item => ({
        ...item, 
        type: 'internship', 
        category: 'Experience',
        icon: 'building'
      })),
      ...(data.post_to_no?.leadership || []).map(item => ({
        ...item, 
        type: 'leadership', 
        category: 'Leadership',
        icon: 'users'
      })),
      ...(data.post_to_no?.research_publications || []).map(item => ({
        ...item, 
        type: 'research', 
        category: 'Research',
        icon: 'book'
      }))
    ];

    return metricsWithTimestamps
      .filter(item => item.timestamp && item.timestamp.length > 0)
      .map((item, index) => {
        // Check if the first element of the array exists and is a string
        const timeAgo = (typeof item.timestamp[0] === 'string') ? item.timestamp[0].toLowerCase() : '';
        let monthOffset = 0;
        if (timeAgo.includes('week')) monthOffset = 0;
        else if (timeAgo.includes('1') && timeAgo.includes('month')) monthOffset = 1;
        else if (timeAgo.includes('3') && timeAgo.includes('month')) monthOffset = 3;
        else if (timeAgo.includes('5') && timeAgo.includes('month')) monthOffset = 5;
        else if (timeAgo.includes('7') && timeAgo.includes('month')) monthOffset = 7;
        
        const currentMonth = new Date().getMonth();
        const eventMonth = (currentMonth - monthOffset + 12) % 12;
        
        return {
          monthName: monthNames[eventMonth],
          eventNumber: index + 1,
          points: parseInt(item.points) || 0,
          category: item.category,
          type: item.type,
          engagement: (item.reaction || 0) + (item.comments || 0),
          reactions: item.reaction || 0,
          comments: item.comments || 0,
          timestamp: item.timestamp,
          details: item.why || `${item.category} achievement`
        };
      })
      .sort((a, b) => monthNames.indexOf(a.monthName) - monthNames.indexOf(b.monthName));
  }

  static processAllMetricsOverview(data) {
    const metrics = data.post_to_no || {};
    const overview = [];

    // Process each metric type
    Object.entries(metrics).forEach(([metricType, items]) => {
      if (Array.isArray(items)) {
        const totalPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
        const count = items.length;
        const avgPoints = count > 0 ? totalPoints / count : 0;

        overview.push({
          metric: this.formatMetricName(metricType),
          totalPoints,
          count,
          avgPoints: parseFloat(avgPoints.toFixed(1)),
          category: this.getCategoryForMetric(metricType),
          color: this.getColorForMetric(metricType)
        });
      }
    });

    return overview.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  static processPerformanceRadar(data) {
    const metrics = data.post_to_no || {};
    const radarData = [];

    // Define skill mappings
    const skillMappings = {
      hackathon: { skill: 'Competition Skills', max: 25, description: 'Problem-solving and coding competitions' },
      internship: { skill: 'Industry Experience', max: 25, description: 'Professional work experience' },
      certification: { skill: 'Technical Certifications', max: 25, description: 'Industry-recognized qualifications' },
      project: { skill: 'Project Development', max: 25, description: 'Full-stack and research projects' },
      leadership: { skill: 'Leadership', max: 20, description: 'Team and organizational leadership' },
      research_publications: { skill: 'Research & Innovation', max: 15, description: 'Academic publications and research' }
    };

    Object.entries(skillMappings).forEach(([key, config]) => {
      const items = metrics[key] || [];
      const totalPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
      const normalizedValue = Math.min((totalPoints / config.max) * 100, 100);

      radarData.push({
        skill: config.skill,
        value: parseFloat(normalizedValue.toFixed(1)),
        description: config.description,
        actualPoints: totalPoints,
        maxPoints: config.max
      });
    });

    return radarData;
  }

  static processPointsDistribution(data) {
    const metrics = data.post_to_no || {};
    const distribution = [];

    const categoryColors = {
      'Competitions': '#3B82F6',
      'Experience': '#10B981',
      'Education': '#F59E0B',
      'Leadership': '#8B5CF6',
      'Research': '#EF4444',
      'Skills': '#06B6D4'
    };

    Object.entries(metrics).forEach(([metricType, items]) => {
      if (Array.isArray(items)) {
        const totalPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
        const category = this.getCategoryForMetric(metricType);
        
        if (totalPoints > 0) {
          distribution.push({
            category: this.formatMetricName(metricType),
            points: totalPoints,
            count: items.length,
            fill: categoryColors[category] || '#6B7280',
            percentage: 0, // Will be calculated after all data is collected
            description: `${items.length} items contributing ${totalPoints} points`
          });
        }
      }
    });

    // Calculate percentages
    const totalPoints = distribution.reduce((sum, item) => sum + item.points, 0);
    distribution.forEach(item => {
      item.percentage = parseFloat(((item.points / totalPoints) * 100).toFixed(1));
    });

    return distribution;
  }

  static processDetailedMetrics(data) {
    const metrics = data.post_to_no || {};
    const detailed = [];

    Object.entries(metrics).forEach(([metricType, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          detailed.push({
            id: `${metricType}-${index}`,
            category: this.formatMetricName(metricType),
            points: parseInt(item.points) || 0,
            description: item.why || item.type || 'Achievement',
            timestamp: item.timestamp || null,
            engagement: (item.reaction || 0) + (item.comments || 0),
            reactions: item.reaction || 0,
            comments: item.comments || 0,
            metricType,
            details: item
          });
        });
      }
    });

    return detailed.sort((a, b) => b.points - a.points);
  }

  static processEngagementData(data) {
    const engagement = [];
    const metricsWithEngagement = ['hackathon', 'internship', 'leadership', 'research_publications','project','inhouse_project','coding_platform','certification','membership','assessment','cgpa'];

    metricsWithEngagement.forEach(metricType => {
      const items = data.post_to_no?.[metricType] || [];
      items.forEach((item, index) => {
        if (item.reaction || item.comments) {
          engagement.push({
            event: `${this.formatMetricName(metricType)} ${index + 1}`,
            eventDetails: item.why || item.type || 'Achievement',
            reactions: item.reaction || 0,
            comments: item.comments || 0,
            total: (item.reaction || 0) + (item.comments || 0),
            points: parseInt(item.points) || 0,
            timestamp: item.timestamp || 'Unknown'
          });
        }
      });
    });

    return engagement.sort((a, b) => b.total - a.total);
  }

  static formatMetricName(metricType) {
    const nameMap = {
      'hackathon': 'Hackathons',
      'internship': 'Internships',
      'certification': 'Certifications',
      'project': 'Projects',
      'inhouse_project': 'In-House Projects',
      'coding_platform': 'Coding Platforms',
      'membership': 'Memberships',
      'assessment': 'Assessments',
      'leadership': 'Leadership',
      'research_publications': 'Research Publications',
      'cgpa': 'Academic Performance'
    };
    return nameMap[metricType] || metricType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  static getCategoryForMetric(metricType) {
    const categoryMap = {
      'hackathon': 'Competitions',
      'internship': 'Experience',
      'certification': 'Education',
      'project': 'Skills',
      'inhouse_project': 'Skills',
      'coding_platform': 'Skills',
      'membership': 'Education',
      'assessment': 'Education',
      'leadership': 'Leadership',
      'research_publications': 'Research',
      'cgpa': 'Education'
    };
    return categoryMap[metricType] || 'Other';
  }

  static getColorForMetric(metricType) {
    const colorMap = {
      'hackathon': '#3B82F6',
      'internship': '#10B981',
      'certification': '#F59E0B',
      'project': '#06B6D4',
      'inhouse_project': '#84CC16',
      'coding_platform': '#6366F1',
      'membership': '#F97316',
      'assessment': '#EC4899',
      'leadership': '#8B5CF6',
      'research_publications': '#EF4444',
      'cgpa': '#14B8A6'
    };
    return colorMap[metricType] || '#6B7280';
  }

  static calculateOverallScore(data) {
    const metrics = data.post_to_no || {};
    let totalPoints = 0;
    let maxPossiblePoints = 0;

    // Define max points for each category (based on placement matrix)
    const maxPoints = {
      'cgpa': 5,
      'hackathon': 15, // Multiple competitions
      'internship': 10, // Multiple internships
      'certification': 15, // Multiple certifications
      'project': 15, // Multiple projects
      'inhouse_project': 8,
      'coding_platform': 5,
      'membership': 6, // Multiple memberships
      'assessment': 10,
      'leadership': 8,
      'research_publications': 10
    };

      Object.entries(metrics).forEach(([metricType, items]) => {
        if (Array.isArray(items)) {
          const categoryPoints = items.reduce((sum, item) => sum + (parseInt(item.points) || 0), 0);
          totalPoints += categoryPoints;
          // Use actual points or predefined max, whichever is higher
          const categoryMax = maxPoints[metricType] || 5;
          maxPossiblePoints += Math.max(categoryPoints, categoryMax);
        }
      });

    return {
      totalPoints,
      maxPossiblePoints,
      percentage: maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints * 100).toFixed(1) : 0,
      grade: this.calculateGrade(totalPoints, maxPossiblePoints)
    };
  }

  static calculateGrade(actual, max) {
    const percentage = (actual / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    return 'C';
  }
}