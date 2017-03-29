#include <stdio.h>
int main(int argc,char*argv[])
{
    int a=10;
    int b=4;
    int c=a/b;
    int d=c*a*b++;
    std::cout<<d<<std::endl;
    return 0;
}
