export class ElementChangeSet
{
   constructor()
   {
      this.left = false;
      this.top = false;
      this.width = false;
      this.height = false;
      this.zIndex = false;
      this.transform = false;
   }

   set(value)
   {
      this.left = value;
      this.top = value;
      this.width = value;
      this.height = value;
      this.zIndex = value;
      this.transform = value;
   }
}
