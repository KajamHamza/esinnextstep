
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Award, Calendar, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Achievement } from "@/types/profile";

interface AchievementsSectionProps {
    achievements: Achievement[];
}

export const AchievementsSection = ({ achievements }: AchievementsSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Earned badges and achievements</CardDescription>
            </CardHeader>
            <CardContent>
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No achievements yet. Complete tasks to earn badges!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface AchievementCardProps {
    achievement: Achievement;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
    return (
        <div className="flex space-x-4 p-4 border rounded-lg">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-700">
                {achievement.badge_image_url ? (
                    <img
                        src={achievement.badge_image_url}
                        alt={achievement.name}
                        className="h-8 w-8"
                    />
                ) : (
                    <Award className="h-6 w-6" />
                )}
            </div>
            <div className="flex-1">
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                    <span className="mx-1">•</span>
                    <span className="font-medium text-purple-600">+{achievement.xp_awarded} XP</span>
                </div>
            </div>
        </div>
    );
};