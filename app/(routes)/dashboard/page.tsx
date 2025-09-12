import React from 'react'

import StatsCard from '@/components/dashboard/StatsCard';
import { fetchModels } from '@/app/action/model-action';
import { getCredits } from '@/app/action/self';
import { getImage } from '@/app/action/image-actions';
import RecentImages from '@/components/dashboard/RecentImages';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentModel from '@/components/dashboard/RecentModel';
import { currentUser } from '@clerk/nextjs/server';


export default async function Dashboard() {
    const user = await currentUser(); 

    const { data: models, count: modelCount } = await fetchModels();

    const { data: credits } = await getCredits();
    const { data: images } = await getImage();

    const imageCount = images?.length || 0

  return (
      <section className='conatiner mx-auto flex-1 space-x-6'>
          
          <div className='flex items-center justify-between'>
              <h2 className='text-3xl font-bold tracking-tight'>Welcome back, { user?.firstName } </h2>
          </div>   

          <StatsCard
              imageCount={imageCount}
              modelCount={modelCount}
              credits={credits!}
          />
          
          <div className='grid gap-6 grid-cols-4'>
              <RecentImages images={images?.slice(0, 6) ?? []}
              />

              <div className='h-full flex flex-col space-y-6'>
                  <QuickActions />
                  
                  <RecentModel model={models} />
              </div>

          </div>
    </section>
  )
}
