'use client';

import type { Locale } from '@/lib/i18n/config';
import { Stepper, StepperControls, type StepperStep } from '@/components/ui/Stepper';
import {
  StatsCard,
  RevenueStatsCard,
  OrdersStatsCard,
  CustomersStatsCard,
  ConversionStatsCard,
} from '@/components/ui/StatsCard';
import { Card } from '@/components/ui/Card';

export default function ComponentsDemoPage({ params }: { params: { locale: Locale } }) {
  // Sample stepper data
  const orderSteps: StepperStep[] = [
    {
      id: '1',
      title: 'Order Placed',
      status: 'completed',
      statusLabel: 'Completed',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Payment Confirmed',
      status: 'completed',
      statusLabel: 'Completed',
      time: '2 hours ago',
    },
    {
      id: '3',
      title: 'Code Assigned',
      status: 'active',
      statusLabel: 'In Progress',
      time: 'Just now',
    },
    {
      id: '4',
      title: 'Email Sent',
      status: 'pending',
      statusLabel: 'Pending',
    },
  ];

  const checkoutSteps: StepperStep[] = [
    {
      id: '1',
      title: 'Shopping Cart',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      id: '2',
      title: 'Checkout Details',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      id: '3',
      title: 'Payment',
      status: 'active',
      statusLabel: 'Current Step',
    },
    {
      id: '4',
      title: 'Confirmation',
      status: 'pending',
      statusLabel: 'Pending',
    },
  ];

  return (
    <div className="p-8 space-y-12 bg-background-secondary min-h-screen">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          🎨 UI Components Demo
        </h1>
        <p className="text-text-secondary">
          Preview of new premium components in action
        </p>
      </div>

      {/* Stats Cards Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
          📊 Stats Cards
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RevenueStatsCard
            value="$45,231"
            percentChange={12.5}
            progress={76}
          />
          
          <OrdersStatsCard
            value="1,234"
            percentChange={8.2}
            progress={65}
          />
          
          <CustomersStatsCard
            value="573"
            percentChange={-3.1}
            progress={45}
          />
          
          <ConversionStatsCard
            value="3.24%"
            percentChange={5.4}
            progress={82}
          />
        </div>

        {/* Custom Stats Cards */}
        <h3 className="text-lg font-semibold text-text-primary mb-4 mt-8">
          Custom Variants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Active Users"
            value="2,847"
            percentChange={15.3}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconColor="primary"
            progress={68}
          />
          
          <StatsCard
            title="Avg Order Value"
            value="$86.50"
            percentChange={4.8}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            iconColor="success"
            progress={92}
          />
          
          <StatsCard
            title="Response Time"
            value="1.2s"
            percentChange={-12.3}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="warning"
            progress={38}
            trend="up"
          />
        </div>
      </section>

      {/* Stepper Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
          📝 Stepper Components
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Processing Stepper */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Order Processing Flow
            </h3>
            <Stepper steps={orderSteps} />
            <StepperControls
              previousLabel="Cancel Order"
              nextLabel="Proceed"
              onPrevious={() => alert('Cancel order')}
              onNext={() => alert('Proceed to next step')}
            />
          </div>

          {/* Checkout Stepper */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Checkout Process
            </h3>
            <Stepper steps={checkoutSteps} />
            <StepperControls
              previousLabel="Back to Cart"
              nextLabel="Continue"
              onPrevious={() => alert('Back to cart')}
              onNext={() => alert('Continue to next')}
            />
          </div>
        </div>
      </section>

      {/* Combined Example */}
      <section>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
          🎯 Combined Example - Order Dashboard
        </h2>
        
        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold text-text-primary">
                Today's Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Revenue"
                  value="$12,450"
                  percentChange={8.5}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  iconColor="success"
                  progress={75}
                />
                
                <StatsCard
                  title="Orders"
                  value="142"
                  percentChange={12.3}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                  iconColor="primary"
                  progress={85}
                />
              </div>
            </div>

            {/* Recent Order Status */}
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Recent Order
              </h3>
              <Stepper
                steps={[
                  {
                    id: '1',
                    title: 'Received',
                    status: 'completed',
                    statusLabel: 'Done',
                    time: '5 min ago',
                  },
                  {
                    id: '2',
                    title: 'Processing',
                    status: 'active',
                    statusLabel: 'Now',
                  },
                  {
                    id: '3',
                    title: 'Delivered',
                    status: 'pending',
                  },
                ]}
                className="shadow-none"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Color Variations */}
      <section>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
          🎨 Color Variations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Success"
            value="100%"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            iconColor="success"
            progress={100}
          />
          
          <StatsCard
            title="Primary"
            value="1,234"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            iconColor="primary"
            progress={75}
          />
          
          <StatsCard
            title="Warning"
            value="45"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconColor="warning"
            progress={45}
          />
          
          <StatsCard
            title="Error"
            value="12"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="error"
            progress={25}
          />
        </div>
      </section>
    </div>
  );
}

