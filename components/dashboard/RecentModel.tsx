import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

function RecentModel({models}:any) {
  return (
      <Card>
          <CardHeader >
              <CardTitle >
                 Recent Models
              </CardTitle>
          </CardHeader>

          <CardContent className='grid gap-4'>
              <div className='space-y-4'>
                  {
                      models?.length === 0 ? <p>No models trained yet</p> : models?.map((model: any) => {
                          return <div key={model.id} className='flex items-center justify-between space-x-4'>
                              <div>
                                  <p className='text-sm font-medium'>{model.modelName}</p>
                                  <p className='text-sm text-muted-foreground'>{model.gender}</p>
                              </div>
                              <Badge variant={getStatusVariant(model.trainigStatus )}>
                              { model.trainigStatus }
                            </Badge>
                              
                          </div>
                      })
                  }
            </div>
              
          </CardContent>
      </Card>
  )
}

export default RecentModel


function getStatusVariant(status: string) {
    switch (status) {
        case "succeeded":
            return "default"
        case "processing":
            return "secondary"
        case "failed":
        case "canceled":
            return "destructive" 
        default:
            return "outline" 
    }
}