import express from 'express';
import { Complaint } from '../models/complaintModel.js';

async function getTodayCount() {
    try {
      const today = new Date();
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
      const todayCount = await Complaint.countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });
  
      return todayCount;
    } catch (err) {
      console.error('Error getting today count:', err);
      throw err;
    }
  }
// Function to get the count of complaints for this week
async function getThisWeekCount() {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const lastDayOfWeek = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + 6);

  const thisWeekCount = await Complaint.countDocuments({
    createdAt: {
      $gte: firstDayOfWeek,
      $lte: lastDayOfWeek,
    },
  });

  return thisWeekCount;
}

// Function to get the count of complaints for the previous 4 weeks
async function getPreviousFourWeeksCount() {
    try {
      const today = new Date();
      const fourWeeksAgo = new Date(today.setDate(today.getDate() - 28));
  
      const previousFourWeeks = await Complaint.aggregate([
        {
          $match: {
            createdAt: {
              $gte: fourWeeksAgo,
              $lt: today,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              week: { $week: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': -1,
            '_id.week': -1,
          },
        },
      ]);
  
      return previousFourWeeks;
    } catch (err) {
      console.error('Error getting previous four weeks count:', err);
      throw err;
    }
}
// Function to get the count of complaints for each month
async function getMonthlyCount() {
  const monthlyCount = await Complaint.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': -1,
        '_id.month': -1,
      },
    },
  ]);

  return monthlyCount;
}

// Function to get the count of complaints for each year
async function getYearlyCount() {
  const yearlyCount = await Complaint.aggregate([
    {
      $group: {
        _id: { $year: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id': -1,
      },
    },
  ]);

  return yearlyCount;
}

// Example usage
async function displayCounts() {
  try {
    const todayCount = await getTodayCount();
    const thisWeekCount = await getThisWeekCount();
    const previousFourWeeks = await getPreviousFourWeeksCount();
    const monthlyCount = await getMonthlyCount();
    const yearlyCount = await getYearlyCount();

    // console.log('Today:', todayCount);
    // console.log('This Week:', thisWeekCount);
    // previousFourWeeks.forEach((week) => {
    //     console.log(`Week ${week._id.week} (Year ${week._id.year}): ${week.count}`);
    //   });
    // console.log('Monthly Count:', monthlyCount);
    // console.log('Yearly Count:', yearlyCount);
  } catch (err) {
    console.error(err);
  }
}

export default displayCounts;