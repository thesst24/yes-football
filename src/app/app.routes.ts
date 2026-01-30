import { Routes } from '@angular/router';
import { CardCheck } from './user/card-check/card-check';
import { Card } from './components/card/card';
import { UserLogin } from './user/user-login/user-login';
import { Sidebar } from './components/sidebar/sidebar';
import { Members } from './admin/members/members';
import { AdminLogin } from './admin/admin-login/admin-login';
import { Pages } from './admin/pages/pages';
import { Event } from './admin/event/event';
import { AddMember } from './admin/members/add-member/add-member';
import { CheckIn } from './admin/check-in/check-in';
import { CardCheckin } from './card-checkin/card-checkin';
import { EventUser } from './user/event-user/event-user';
import { Join } from './popup/join/join';
import { Main } from './admin/main/main';
import { Login } from './test/login/login';
import { Register } from './test/register/register';
import { Member } from './services/member';

export const routes: Routes = [
    { path: '',redirectTo:'user-login', pathMatch:'full' },    
    { path: 'card-check', component:CardCheck},
    { path: 'card', component: Card},
    { path: 'user-login', component: UserLogin},
    { path: 'sidebar',component: Sidebar},
    { path: 'add-member',component:AddMember},
    { path: 'card-checkin',component:CardCheckin},
    { path: 'admin-login', component: AdminLogin},
    { path: 'pages',component: Pages},
    { path: 'event-user', component: EventUser},
    { path: 'login',component:Login},
    { path: 'register',component:Register},
    { path: 'popupjoin', component: Join},
    { path:'',
        component: Pages,
        children: [ 
            { path: 'member',component:Members},
            { path: 'members/create', component: Members },
            { path: 'members/edit/:id', component: Members },
            { path: 'event', component: Event},
            { path: 'check-in',component: CheckIn },
        ]
    }

];
