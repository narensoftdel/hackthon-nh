import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Position {
  x: number;
  y: number;
}

interface FireLocation {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

interface Exit {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Route {
  exitId: string;
  score: number;
  route: Position[];
}

@Component({
  selector: 'app-floor-plan',
  standalone: false,
  templateUrl: './floor-plan.component.html',
  styleUrls: ['./floor-plan.component.scss']
})
export class FloorPlanComponent implements OnInit, AfterViewInit {
  @ViewChild('floorPlanCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  userPosition: Position = { x: 200, y: 100 };
  fireLocations: FireLocation[] = [
    { id: 1, x: 300, y: 150, active: true },
    { id: 2, x: 420, y: 280, active: false }
  ];
  showAllRoutes = false;
  isNavigating = false;
  currentStep = 0;
  selectedExit: string | null = null;

  // Math reference for template
  Math = Math;

  // Exit locations based on the floor plan
  exits: Exit[] = [
    { id: 'exit1', x: 260, y: 50, label: 'North Exit' },
    { id: 'exit2', x: 50, y: 200, label: 'West Exit' },
    { id: 'exit3', x: 260, y: 350, label: 'South Exit' }
  ];

  // Pre-defined safe routes to each exit
  routes: { [key: string]: Position[] } = {
    exit1: [
      { x: 150, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 150 }, 
      { x: 250, y: 150 }, { x: 250, y: 100 }, { x: 260, y: 50 }
    ],
    exit2: [
      { x: 150, y: 200 }, { x: 100, y: 200 }, { x: 50, y: 200 }
    ],
    exit3: [
      { x: 150, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 250 }, 
      { x: 250, y: 250 }, { x: 250, y: 300 }, { x: 260, y: 350 }
    ]
  };

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    this.drawFloorPlan();
  }

  // Calculate route safety score (lower is better)
  calculateRouteSafety(routeKey: string): number {
    const route = this.routes[routeKey];
    // Score is based on total distance from userPosition to exit
    const exit = this.exits.find(e => e.id === routeKey);
    if (!exit) return Number.MAX_SAFE_INTEGER;
    // Calculate direct distance from user to exit
    let score = Math.sqrt(
      Math.pow(this.userPosition.x - exit.x, 2) +
      Math.pow(this.userPosition.y - exit.y, 2)
    );
    // Add penalty for proximity to fire along the route
    this.fireLocations.forEach(fire => {
      if (fire.active) {
        route.forEach(point => {
          const distance = Math.sqrt(
            Math.pow(point.x - fire.x, 2) + Math.pow(point.y - fire.y, 2)
          );
          if (distance < 80) score += 50; // Heavy penalty for close proximity
          else if (distance < 120) score += 20; // Medium penalty
        });
      }
    });
    return score;
  }

  // Get the safest route
  getSafestRoute(): Route {
    const routeScores = Object.keys(this.routes).map(key => ({
      exitId: key,
      score: this.calculateRouteSafety(key),
      route: this.routes[key]
    }));
    
    return routeScores.sort((a, b) => a.score - b.score)[0];
  }

  // Get nearest exit
  getNearestExit(): Exit {
    return this.exits.reduce((nearest, exit) => {
      const distance = Math.sqrt(
        Math.pow(this.userPosition.x - exit.x, 2) + 
        Math.pow(this.userPosition.y - exit.y, 2)
      );
      const nearestDistance = Math.sqrt(
        Math.pow(this.userPosition.x - nearest.x, 2) + 
        Math.pow(this.userPosition.y - nearest.y, 2)
      );
      return distance < nearestDistance ? exit : nearest;
    });
  }

  // Get safest exit label
  getSafestExit(): Exit {
    const safestRoute = this.getSafestRoute();
    return this.exits.find(exit => exit.id === safestRoute.exitId)!;
  }

  // Start navigation
  startNavigation() {
    // Find the nearest exit
    const nearestExit = this.getNearestExit();
    // Get the route to the nearest exit
    const routeToNearest = this.routes[nearestExit.id];
    // Build route starting from userPosition
    const fullRoute = [this.userPosition, ...routeToNearest];
    // Calculate safety score for this route
    const score = this.calculateRouteSafety(nearestExit.id);
    // Prepare route object
    const routeObj: Route = {
      exitId: nearestExit.id,
      score,
      route: fullRoute
    };
    this.selectedExit = routeObj.exitId;
    this.isNavigating = true;
    this.currentStep = 0;

    // Animate through route points
    const animateRoute = () => {
      if (this.currentStep < routeObj.route.length - 1) {
        setTimeout(() => {
          this.currentStep++;
          this.drawFloorPlan();
          animateRoute();
        }, 800);
      } else {
        this.isNavigating = false;
      }
    };

    setTimeout(() => {
      this.currentStep++;
      this.drawFloorPlan();
      animateRoute();
    }, 800);
  }

  // Reset navigation
  resetNavigation() {
    this.isNavigating = false;
    this.currentStep = 0;
    this.selectedExit = null;
    this.drawFloorPlan();
  }

  // Toggle all routes visibility
  toggleAllRoutes() {
    this.showAllRoutes = !this.showAllRoutes;
    this.drawFloorPlan();
  }

  // Toggle fire location
  toggleFire(fireId: number) {
    this.fireLocations = this.fireLocations.map(fire => 
      fire.id === fireId ? { ...fire, active: !fire.active } : fire
    );
    this.drawFloorPlan();
  }

  // Handle canvas click for moving user
  handleCanvasClick(event: MouseEvent) {
    if (this.isNavigating) return;
    
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Check if click is within building bounds
    if (x >= 40 && x <= 480 && y >= 40 && y <= 360) {
      this.userPosition = { x, y };
      this.resetNavigation();
      this.drawFloorPlan();
    }
  }

  // Draw the floor plan and routes
  drawFloorPlan() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor plan background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw rooms and walls
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Main building outline
    ctx.strokeRect(40, 40, 440, 320);
    
    // Internal room divisions (simplified based on floor plan)
    const rooms = [
      { x: 80, y: 80, w: 80, h: 80 },
      { x: 180, y: 80, w: 80, h: 80 },
      { x: 280, y: 80, w: 80, h: 80 },
      { x: 380, y: 80, w: 80, h: 80 },
      
      { x: 80, y: 180, w: 80, h: 80 },
      { x: 180, y: 180, w: 80, h: 80 },
      { x: 280, y: 180, w: 80, h: 80 },
      { x: 380, y: 180, w: 80, h: 80 },
      
      { x: 80, y: 280, w: 80, h: 80 },
      { x: 180, y: 280, w: 80, h: 80 },
      { x: 280, y: 280, w: 80, h: 80 },
      { x: 380, y: 280, w: 80, h: 80 }
    ];
    
    rooms.forEach(room => {
      ctx.strokeRect(room.x, room.y, room.w, room.h);
    });
    
    // Draw corridors
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(40, 200, 440, 40); // Horizontal corridor
    ctx.fillRect(240, 40, 40, 320); // Vertical corridor
    
    // Draw exits
    this.exits.forEach(exit => {
      ctx.fillStyle = '#28a745';
      ctx.fillRect(exit.x - 15, exit.y - 10, 30, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', exit.x, exit.y + 4);
    });
    
    // Draw all routes if enabled
    if (this.showAllRoutes) {
      const colors = ['#ffc107', '#17a2b8', '#6f42c1'];
      Object.keys(this.routes).forEach((routeKey, index) => {
        ctx.strokeStyle = colors[index];
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        const route = this.routes[routeKey];
        ctx.beginPath();
        ctx.moveTo(route[0].x, route[0].y);
        route.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
    
    // Draw selected route (safest)
    if (this.selectedExit || this.isNavigating) {
      const safestRoute = this.getSafestRoute();
      // Find the nearest route point to userPosition
      const routePoints = this.routes[safestRoute.exitId];
      let minDist = Number.MAX_SAFE_INTEGER;
      let nearestIdx = 0;
      routePoints.forEach((pt, idx) => {
        const dist = Math.sqrt(
          Math.pow(this.userPosition.x - pt.x, 2) +
          Math.pow(this.userPosition.y - pt.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });
      // Build route: userPosition -> nearest route point -> rest of route
      const route = [
        this.userPosition,
        ...routePoints.slice(nearestIdx)
      ];
      ctx.strokeStyle = '#3551dcff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(route[0].x, route[0].y);
      route.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      // Draw animated progress
      if (this.isNavigating && this.currentStep > 0) {
        ctx.fillStyle = '#35dc40ff';
        const currentPoint = route[this.currentStep];
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        // Draw progress line
        ctx.strokeStyle = '#35dc40ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(route[0].x, route[0].y);
        for (let i = 1; i <= this.currentStep; i++) {
          ctx.lineTo(route[i].x, route[i].y);
        }
        ctx.stroke();
      }
    }
    
    // Draw fire locations
    this.fireLocations.forEach(fire => {
      if (fire.active) {
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(fire.x, fire.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Fire danger zone
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(fire.x, fire.y, 80, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    // Draw user position
    ctx.fillStyle = '#007bff';
    ctx.beginPath();
    ctx.arc(this.userPosition.x, this.userPosition.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', this.userPosition.x, this.userPosition.y + 4);
  }
}
