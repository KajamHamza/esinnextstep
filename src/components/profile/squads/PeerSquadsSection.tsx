
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar,
  ChevronRight,
  Crown,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { PeerSquadMember } from "@/types/profile";

interface PeerSquadsSectionProps {
  peerSquads: PeerSquadMember[];
}

export const PeerSquadsSection = ({ peerSquads }: PeerSquadsSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Peer Squads</CardTitle>
          <CardDescription>Your peer learning groups</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Squad
        </Button>
      </CardHeader>
      <CardContent>
        {peerSquads.length > 0 ? (
          <div className="space-y-4">
            {peerSquads.map((squad) => (
              <SquadCard key={squad.peer_squad_id} squad={squad} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">You haven't joined any peer squads yet.</p>
            <Button className="mt-4" variant="outline">Find a Squad</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SquadCardProps {
  squad: PeerSquadMember;
}

const SquadCard = ({ squad }: SquadCardProps) => {
  return (
    <div className="border p-4 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">{squad.squad.name}</h3>
            {squad.role === 'leader' && (
              <Badge variant="outline" className="ml-2 flex items-center">
                <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                Leader
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {squad.squad.skill_focus.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Joined {formatDistanceToNow(new Date(squad.joined_at), { addSuffix: true })}
          </div>
        </div>
        <Link to={`/peer-squads/${squad.peer_squad_id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
